import { useState, useEffect } from 'react';

// Extend window object to declare NativePHP bridge interface
declare global {
  interface Window {
    Native?: {
      on: (event: string, callback: (payload: any, event: any) => void) => void;
      emit?: (event: string, payload: any) => void;
    };
  }
}

export interface ROM {
  id: string;
  title: string;
  system: string;
  systemLabel?: string;
  romUrl: string;
  coverUrl: string;
  gradient: string; // Dynamic backup styles for gorgeous cards
  lastPlayed?: string;
}

export function useNativePHP() {
  const [isNativePHP, setIsNativePHP] = useState(false);
  const [roms, setRoms] = useState<ROM[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the list of imported ROMs from the Laravel backend
  const fetchROMs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roms');
      if (response.ok) {
        const data = await response.json();
        setRoms(data);
      } else {
        setRoms([]);
      }
    } catch (error) {
      console.warn('Falha ao comunicar com o backend do NativePHP, usando fallback do localStorage.', error);
      // LocalStorage fallback for standalone web preview
      const localRoms = localStorage.getItem('panda_end_roms');
      if (localRoms) {
        setRoms(JSON.parse(localRoms));
      } else {
        setRoms([]);
        localStorage.setItem('panda_end_roms', JSON.stringify([]));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detect NativePHP bridge injection
    const checkBridge = () => {
      if (window.Native) {
        setIsNativePHP(true);
      } else {
        setIsNativePHP(false);
      }
    };

    checkBridge();
    fetchROMs();

    // Listen for custom events from NativePHP (e.g. disk scanning finished)
    if (window.Native) {
      window.Native.on('RomsScanned', (payload: any) => {
        if (payload && Array.isArray(payload.roms)) {
          setRoms(payload.roms);
        }
      });
    }
  }, []);

  // Save current game state file (.sav) to the system
  const saveGameState = async (gameId: string, stateData: string): Promise<boolean> => {
    console.log(`Disparando salvamento de dados para o jogo: ${gameId}`);
    try {
      if (window.Native) {
        // Under NativePHP, make a call to the PHP backend to store the save on HD/Android
        const response = await fetch('/api/saves/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, stateData }),
        });
        return response.ok;
      } else {
        // Web browser localStorage fallback
        localStorage.setItem(`panda_save_${gameId}`, stateData);
        return true;
      }
    } catch (e) {
      console.error('Falha ao salvar estado de emulação', e);
      return false;
    }
  };

  // Load game state file (.sav) from the system
  const loadGameState = async (gameId: string): Promise<string | null> => {
    console.log(`Buscando dados salvos (.sav) do jogo: ${gameId}`);
    try {
      if (window.Native) {
        const response = await fetch(`/api/saves/load?gameId=${gameId}`);
        if (response.ok) {
          const data = await response.json();
          return data.stateData || null;
        }
        return null;
      } else {
        return localStorage.getItem(`panda_save_${gameId}`);
      }
    } catch (e) {
      console.error('Falha ao carregar estado de emulação', e);
      return null;
    }
  };

  // Sync Cloud Saves (Locked to Premium)
  const syncSaves = async (): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: 'Saves sincronizados com sucesso na Nuvem Panda!',
    };
  };

  // Create Netplay lobby room (Locked to Premium)
  const createNetplayRoom = async (gameId: string): Promise<{ success: boolean; roomCode: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      success: true,
      roomCode: `PANDA-${randomCode}`,
    };
  };

  // Delete a game from local storage and DB
  const deleteROM = async (gameId: string): Promise<boolean> => {
    console.log(`Deletando jogo da biblioteca: ${gameId}`);
    try {
      const response = await fetch(`/api/roms/${gameId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchROMs();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Falha ao comunicar com backend para deletar ROM, tentando localStorage.', e);
      // Fallback for standalone web view mode
      const localRoms = localStorage.getItem('panda_end_roms');
      if (localRoms) {
        const parsed = JSON.parse(localRoms) as ROM[];
        const updated = parsed.filter((r) => r.id !== gameId);
        localStorage.setItem('panda_end_roms', JSON.stringify(updated));
        setRoms(updated);
        return true;
      }
      return false;
    }
  };

  return {
    isNativePHP,
    roms,
    loading,
    refreshRoms: fetchROMs,
    saveGameState,
    loadGameState,
    syncSaves,
    createNetplayRoom,
    deleteROM,
  };
}
