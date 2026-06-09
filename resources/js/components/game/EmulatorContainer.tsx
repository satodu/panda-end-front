import React, { useEffect, useState } from 'react';
import { useNativePHP, ROM } from '@/hooks/useNativePHP';
import { ArrowLeft, Loader2, Gamepad } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmulatorContainerProps {
  game: ROM;
  onExit: () => void;
}

export default function EmulatorContainer({ game, onExit }: EmulatorContainerProps) {
  const { saveGameState, loadGameState } = useNativePHP();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [gameLoaded, setGameLoaded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isAndroid = typeof window !== 'undefined' && !!(window as any).AndroidBridge;
  const useWidePadding = isAndroid && isLandscape;

  const handleExit = async () => {
    setIsSaving(true);
    setSaveStatus('Exportando save (.sav) do emulador...');
    
    // Simulate serializing and writing the .sav file back to the native file system
    const mockSaveData = JSON.stringify({
      timestamp: Date.now(),
      score: Math.floor(Math.random() * 99999),
      level: Math.floor(Math.random() * 10) + 1,
      romId: game.id,
      state: 'SAV_STATE_STABLE'
    });

    const success = await saveGameState(game.id, mockSaveData);
    
    if (success) {
      setSaveStatus('Save persistido no disco com sucesso!');
    } else {
      setSaveStatus('Falha ao gravar save no HD.');
    }

    setTimeout(() => {
      setIsSaving(false);
      onExit();
    }, 1000);
  };

  const handleExitRef = React.useRef(handleExit);
  useEffect(() => {
    handleExitRef.current = handleExit;
  });

  useEffect(() => {
    const androidBridge = (window as any).AndroidBridge;
    if (androidBridge && typeof androidBridge.setFullscreen === 'function') {
      androidBridge.setFullscreen(true);
    }
    return () => {
      if (androidBridge && typeof androidBridge.setFullscreen === 'function') {
        androidBridge.setFullscreen(false);
      }
    };
  }, []);

  useEffect(() => {
    const androidBridge = (window as any).AndroidBridge;
    if (androidBridge && typeof androidBridge.setBackIntercept === 'function') {
      androidBridge.setBackIntercept(true);
    }

    const handleAndroidBack = () => {
      handleExitRef.current();
    };

    if ((window as any).Native) {
      (window as any).Native.on('backpress', handleAndroidBack);
    }

    return () => {
      if (androidBridge && typeof androidBridge.setBackIntercept === 'function') {
        androidBridge.setBackIntercept(false);
      }
      if ((window as any).Native) {
        (window as any).Native.off('backpress', handleAndroidBack);
      }
    };
  }, []);

  useEffect(() => {
    const checkSave = async () => {
      setSaveStatus('Buscando arquivo de save local (.sav)...');
      const loadedSave = await loadGameState(game.id);
      if (loadedSave) {
        setSaveStatus('Save encontrado! Iniciando jogo...');
      } else {
        setSaveStatus('Nenhum save localizado. Iniciando novo jogo...');
      }
    };
    checkSave();
  }, [game.id]);

  // Map platform names to EmulatorJS core slugs
  let coreSlug = game.system.toLowerCase();
  if (coreSlug === 'segamd') {
    coreSlug = 'sega';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center text-white overflow-hidden select-none">
      
      {/* Discrete Floating Header Overlay */}
      {!isAndroid && (
        <div 
          style={{ top: 'calc(var(--inset-top, 0px) + 1rem)' }}
          className="hidden md:flex absolute left-4 right-4 z-50 items-center justify-between pointer-events-none"
        >
          
          {/* Sair do Jogo Floating button */}
          <Button
            onClick={handleExit}
            disabled={isSaving}
            className="pointer-events-auto bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-800 gap-2 shadow-lg shadow-black/50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            <span>Sair do Jogo</span>
          </Button>

          {/* HUD Overlay */}
          <div className="flex items-center space-x-3 bg-zinc-900/60 backdrop-blur border border-zinc-850 px-4 py-1.5 rounded-full shadow-lg">
            <Gamepad className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-zinc-300">{game.title} ({game.system})</span>
          </div>
        </div>
      )}

      {/* Simulator canvas / EmulatorJS Iframe Container */}
      <div 
        style={{
          paddingLeft: useWidePadding ? 'max(var(--inset-left, env(safe-area-inset-left, 0px)), 32px)' : 'var(--inset-left, env(safe-area-inset-left, 0px))',
          paddingRight: useWidePadding ? 'max(var(--inset-right, env(safe-area-inset-right, 0px)), 32px)' : 'var(--inset-right, env(safe-area-inset-right, 0px))',
          paddingTop: 'var(--inset-top, env(safe-area-inset-top, 0px))',
          paddingBottom: 'var(--inset-bottom, env(safe-area-inset-bottom, 0px))'
        }}
        className="w-full h-full flex items-center justify-center relative"
      >
        <iframe
          src={`/emulatorjs/player.html?rom=${encodeURIComponent(game.romUrl)}&core=${encodeURIComponent(coreSlug)}&title=${encodeURIComponent(game.title)}`}
          className="w-full h-full border-none"
          allow="autoplay; gamepad"
          onLoad={() => setGameLoaded(true)}
        />

        {/* Loading overlay when EJS is compiling */}
        {!gameLoaded && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-4 text-center z-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-sm font-semibold tracking-wide text-zinc-300 animate-pulse">
              Carregando EmulatorJS Core...
            </p>
            <p className="text-xs text-zinc-550">{saveStatus}</p>
          </div>
        )}
      </div>

      {/* Save Notification Toast/Overlay */}
      {isSaving && (
        <div 
          style={{ bottom: 'calc(var(--inset-bottom, 0px) + 1.5rem)' }}
          className="absolute left-1/2 -translate-x-1/2 z-50 glass-premium border-purple-500/20 px-6 py-3 rounded-full flex items-center space-x-3 shadow-2xl"
        >
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span className="text-xs font-semibold text-zinc-200">{saveStatus}</span>
        </div>
      )}

    </div>
  );
}
