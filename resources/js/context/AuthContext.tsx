import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  is_premium: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  register: (email: string) => Promise<void>;
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

  const login = async (email: string) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simple mock logic: if email contains 'premium', give them premium status by default
    const isPremiumDefault = email.toLowerCase().includes('premium') || email.toLowerCase().includes('panda');
    
    const loggedUser: User = {
      email,
      is_premium: isPremiumDefault,
    };
    
    setUser(loggedUser);
    localStorage.setItem('panda_end_user', JSON.stringify(loggedUser));
  };

  const register = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const loggedUser: User = {
      email,
      is_premium: false, // Starts as Free tier
    };
    setUser(loggedUser);
    localStorage.setItem('panda_end_user', JSON.stringify(loggedUser));
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, togglePremium }}>
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
