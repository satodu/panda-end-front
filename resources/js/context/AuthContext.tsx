import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  is_premium: boolean;
  is_guest?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  togglePremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('panda_end_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('panda_end_user');
      }
    }
  }, []);

  const getLocalUsers = (): any[] => {
    const usersJson = localStorage.getItem('panda_end_local_users');
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveLocalUsers = (users: any[]) => {
    localStorage.setItem('panda_end_local_users', JSON.stringify(users));
  };

  const login = async (email: string, password?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Auto-create default accounts for convenience if they don't exist
    const normalizedEmail = email.toLowerCase().trim();
    const isDefaultPremium = normalizedEmail === 'premium@panda.com' || normalizedEmail === 'panda@panda.com';
    const users = getLocalUsers();

    if (isDefaultPremium && !users.find(u => u.email === normalizedEmail)) {
      users.push({
        email: normalizedEmail,
        password: password || '123456',
        is_premium: true
      });
      saveLocalUsers(users);
    }

    const matchedUser = users.find(u => u.email === normalizedEmail);

    if (!matchedUser || (password && matchedUser.password !== password)) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const loggedUser: User = {
      email: matchedUser.email,
      is_premium: matchedUser.is_premium,
    };
    
    setUser(loggedUser);
    localStorage.setItem('panda_end_user', JSON.stringify(loggedUser));
  };

  const register = async (email: string, password?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const normalizedEmail = email.toLowerCase().trim();
    const users = getLocalUsers();

    if (users.find(u => u.email === normalizedEmail)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const isPremiumDefault = normalizedEmail.includes('premium') || normalizedEmail.includes('panda');

    const newUser = {
      email: normalizedEmail,
      password: password || '',
      is_premium: isPremiumDefault,
    };

    users.push(newUser);
    saveLocalUsers(users);

    const loggedUser: User = {
      email: newUser.email,
      is_premium: newUser.is_premium,
    };

    setUser(loggedUser);
    localStorage.setItem('panda_end_user', JSON.stringify(loggedUser));
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      email: 'guest@panda.com',
      is_premium: false,
      is_guest: true
    };
    setUser(guestUser);
    localStorage.setItem('panda_end_user', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('panda_end_user');
  };

  const togglePremium = () => {
    if (user) {
      const updatedUser = { ...user, is_premium: !user.is_premium };
      setUser(updatedUser);
      localStorage.setItem('panda_end_user', JSON.stringify(updatedUser));
      
      // Update in the local user database as well
      const users = getLocalUsers();
      const userIdx = users.findIndex(u => u.email === user.email);
      if (userIdx !== -1) {
        users[userIdx].is_premium = updatedUser.is_premium;
        saveLocalUsers(users);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, togglePremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
