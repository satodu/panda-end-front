import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNativePHP, ROM } from '@/hooks/useNativePHP';
import GameGrid from '@/components/game/GameGrid';
import ImportView from '@/views/ImportView';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/Dialog';
import { Cloud, Lock, Sparkles, AlertCircle, RefreshCw, Upload, CheckCircle, Trash2 } from 'lucide-react';

interface LibraryViewProps {
  onLaunchGame: (game: ROM) => void;
}

export default function LibraryView({ onLaunchGame }: LibraryViewProps) {
  const { user, togglePremium } = useAuth();
  const { t } = useLanguage();
  const { isNativePHP, syncSaves, roms, refreshRoms, loading, deleteROM } = useNativePHP();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  
  // Floating Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSync = async () => {
    if (!user?.is_premium) {
      setShowUpgrade(true);
      return;
    }

    setIsSyncing(true);
    setSyncStatus(t('library.syncing'));
    
    try {
      const result = await syncSaves();
      setSyncStatus(result.message);
    } catch (e) {
      setSyncStatus('Falha ao sincronizar.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus('');
      }, 2000);
    }
  };

  const handleUpgradeMock = () => {
    togglePremium();
    setShowUpgrade(false);
  };

  const handleImportSuccess = (romTitle: string) => {
    setIsImportOpen(false);
    refreshRoms();
    setToast({
      message: `"${romTitle}" foi importado com sucesso para a biblioteca!`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 4500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {t('library.title')}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('library.count', { count: roms.length })}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Import ROM Dialog Trigger */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 text-xs font-semibold border-zinc-800 hover:border-purple-500/30 text-zinc-300"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('library.import')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-premium border-purple-500/20 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🐼 Importar ROM</span>
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Adicione arquivos de jogos à sua biblioteca local do Panda End.
                </DialogDescription>
              </DialogHeader>
              <ImportView onSuccess={(title) => {
                handleImportSuccess(title);
              }} />
            </DialogContent>
          </Dialog>

          {/* Sync Saves Button */}
          <Button
            variant="glass"
            disabled={isSyncing}
            onClick={handleSync}
            className="gap-2 text-xs font-semibold"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : user?.is_premium ? (
              <Cloud className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
            <span>{isSyncing ? t('library.syncing') : t('library.sync')}</span>
          </Button>

          {user?.is_premium && (
            <Badge variant="premium" className="hidden sm:flex gap-1 py-1 px-3">
              <Sparkles className="w-3 h-3" /> Panda Premium
            </Badge>
          )}
        </div>
      </div>

      {/* Sync Status Alert Banner */}
      {syncStatus && (
        <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl flex items-center space-x-3 text-purple-200 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Game Grid component */}
      <GameGrid 
        onLaunchGame={onLaunchGame} 
        roms={roms}
        loading={loading}
        deleteROM={deleteROM}
        onDeleteSuccess={(title) => {
          setToast({
            message: `"${title}" foi removido com sucesso da biblioteca!`,
            type: 'info'
          });
          setTimeout(() => {
            setToast(null);
          }, 4500);
        }}
      />

      {/* ================= CLOUD SYNC UPGRADE MODAL ================= */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="glass-premium border-purple-500/30 max-w-md">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <div className="mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full w-fit shadow-lg shadow-purple-500/30">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white mt-2">
              Sincronização de Saves na Nuvem
            </DialogTitle>
            <DialogDescription className="text-zinc-300 text-sm">
              Faça backup automático do progresso de seus emuladores retro (.sav) nos servidores Panda de forma segura.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 border-y border-zinc-900 my-2 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Backup automático ao sair de qualquer jogo</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Compartilhe saves entre PC, Android e Linux</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Prevenção contra perda de dados</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-col space-y-2 sm:space-x-0 w-full">
            <Button 
              onClick={handleUpgradeMock}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 shadow-lg shadow-purple-500/20"
            >
              Liberar Premium (Demo Simulação)
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-zinc-200">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in text-zinc-100">
          <div className="glass-premium border-purple-500/30 flex items-center space-x-3 px-5 py-3.5 rounded-xl shadow-2xl min-w-[320px] max-w-sm">
            <div className={`p-2 rounded-lg shrink-0 ${
              toast.type === 'error' ? 'bg-red-500/10 text-red-400' :
              toast.type === 'info' ? 'bg-amber-500/10 text-amber-400' :
              'bg-emerald-500/10 text-emerald-400'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : toast.type === 'info' ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-100">
                {toast.type === 'error' ? 'Erro' : toast.type === 'info' ? t('library.toast.removed') : t('library.toast.updated')}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs font-bold px-1 select-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
