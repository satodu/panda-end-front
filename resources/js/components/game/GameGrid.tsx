import React, { useState } from 'react';
import { useNativePHP, ROM } from '@/hooks/useNativePHP';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/Dialog';
import { Search, Play, Users, Lock, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

// Maps system slugs to local /capas/ filenames
const SYSTEM_COVER_MAP: Record<string, string> = {
  '3do':          '3do.jpg',
  'arcade':       'arcade.jpg',
  'atari2600':    'atari2600.jpg',
  'atari5200':    'atari5200.jpg',
  'atari7800':    'atari7800.jpg',
  'jaguar':       'jaguar.jpg',
  'lynx':         'lynx.jpg',
  'colecovision': 'coleco.jpg',
  'c64':          'c64.jpg',
  'c128':         'c64.jpg',
  'amiga':        'amiga.jpg',
  'pet':          'default.jpg',
  'plus4':        'default.jpg',
  'vic20':        'default.jpg',
  'mame2003':     'mame.jpg',
  'nes':          'nes.jpg',
  'n64':          'n64.jpg',
  'nds':          'nds.jpg',
  'gba':          'gba.jpg',
  'gb':           'gb.jpg',
  'psx':          'psx.jpg',
  'psp':          'psp.jpg',
  'sega32x':      '32x.jpg',
  'segacd':       'segacd.jpg',
  'segagg':       'gamegear.jpg',
  'segams':       'master.jpg',
  'segamd':       'megadrive.jpg',
  'segasaturn':   'saturn.jpg',
  'snes':         'snes.jpg',
  'msx':          'msx.jpg',
  'ngp':          'ngp.jpg',
  'pce':          'tg16.jpg',
  'vb':           'virtualboy.jpg',
  'ws':           'ws.jpg',
};

/** Returns the best coverUrl for a ROM:
 *  1. Local /capas/ path (already correct for newly imported ROMs)
 *  2. Console-level fallback from SYSTEM_COVER_MAP
 *  3. /capas/default.jpg
 */
function getConsoleCover(rom: { system: string; coverUrl: string }): string {
  // If already pointing to our local capas folder, keep it
  if (rom.coverUrl.startsWith('/capas/')) return rom.coverUrl;
  // Otherwise use the system-level cover (handles legacy Unsplash URLs)
  return `/capas/${SYSTEM_COVER_MAP[rom.system] ?? 'default.jpg'}`;
}

interface GameGridProps {
  onLaunchGame: (game: ROM) => void;
  roms: ROM[];
  loading: boolean;
  deleteROM: (id: string) => Promise<boolean>;
  onDeleteSuccess?: (title: string) => void;
}

export default function GameGrid({ onLaunchGame, roms, loading, deleteROM, onDeleteSuccess }: GameGridProps) {
  const { user, togglePremium } = useAuth();
  const { t } = useLanguage();
  
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'netplay' | 'sync'>('netplay');
  
  // Game deletion states
  const [gameToDelete, setGameToDelete] = useState<ROM | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter ROMs based on search query and system selection
  const filteredRoms = roms.filter((rom) => {
    const matchesSearch = rom.title.toLowerCase().includes(search.toLowerCase());
    const matchesSystem = selectedSystem === 'all' || rom.system === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  const handlePremiumAction = (feature: 'netplay' | 'sync') => {
    if (!user?.is_premium) {
      setUpgradeFeature(feature);
      setIsUpgradeOpen(true);
    } else {
      // Premium user action
      alert(feature === 'netplay' 
        ? 'Criando sala Netplay P2P... Conectando ao servidor Panda.' 
        : 'Sincronizando seus arquivos .sav na nuvem...'
      );
    }
  };

  const handleUpgradeMock = () => {
    togglePremium();
    setIsUpgradeOpen(false);
  };

  const handleDeleteClick = (rom: ROM) => {
    setGameToDelete(rom);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;
    setIsDeleting(true);
    const title = gameToDelete.title;
    const success = await deleteROM(gameToDelete.id);
    setIsDeleting(false);
    setIsConfirmDeleteOpen(false);
    setGameToDelete(null);
    if (success) {
      onDeleteSuccess?.(title);
    } else {
      alert(t('delete.fail'));
    }
  };

  // Dynamically calculate which systems actually have games in the library
  const systems = ['all', ...Array.from(new Set(roms.map(rom => rom.system)))];

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder={t('grid.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-950/60 border-zinc-800"
          />
        </div>

        {/* Console Filters */}
        <div className="flex flex-wrap gap-2">
          {systems.map((sys) => {
            const romWithSys = roms.find(r => r.system === sys);
            const sysLabel = sys === 'all' ? t('grid.all') : (romWithSys?.systemLabel || sys.toUpperCase());
            
            return (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                  selectedSystem === sys
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {sysLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of ROM Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Escaneando diretórios locais...</p>
        </div>
      ) : filteredRoms.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-sm">{t('grid.no_games')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoms.map((rom) => (
            <Card 
              key={rom.id} 
              className="group overflow-hidden relative flex flex-col justify-between hover:bg-zinc-800/80 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-900/20 duration-300"
            >
              {/* Cover Art / Gradient Visual */}
              <div className="relative w-full overflow-hidden bg-zinc-950" style={{ aspectRatio: '16/10' }}>
                
                {/* Visual gradient overlay with console system text */}
                <div className={`absolute inset-0 bg-gradient-to-br ${rom.gradient} opacity-20`}></div>
                
                {/* Fallback mock graphic to guarantee visual appeal */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent">
                  <div className="flex justify-between items-start w-full">
                    <Badge variant="outline" className="bg-zinc-900/90 text-[10px] font-bold border-zinc-800 py-0.5 px-2">
                      {rom.systemLabel || rom.system}
                    </Badge>
                  </div>
                  
                  {/* Subtle overlay game details */}
                  <div className="transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[10px] text-zinc-400 font-medium">{t('grid.last_played', { date: rom.lastPlayed || t('grid.never_played') })}</span>
                  </div>
                </div>

                {/* Floating Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(rom);
                  }}
                  className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-red-600 text-zinc-400 hover:text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
                  title={t('grid.delete')}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Cover photo: prefers ROM-specific art, falls back to console cover */}
                <img
                  src={getConsoleCover(rom)}
                  alt={rom.title}
                  className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 duration-300 opacity-75 group-hover:opacity-95 p-2"
                  onError={(e) => {
                    // Final fallback: default console art
                    const img = e.target as HTMLImageElement;
                    if (!img.src.endsWith('/capas/default.jpg')) {
                      img.src = '/capas/default.jpg';
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              </div>

              {/* Game Metadata & Actions */}
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-zinc-100 text-base group-hover:text-purple-400 duration-200 truncate">
                    {rom.title}
                  </h4>
                  <span className="text-xs text-zinc-550">Panda Emulator System</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    onClick={() => onLaunchGame(rom)}
                    className="w-full gap-2 text-xs py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> {t('grid.play')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePremiumAction('netplay')}
                    className="w-full gap-1.5 text-xs py-2 font-semibold border-zinc-800 hover:border-purple-500/30 text-zinc-300"
                  >
                    {user?.is_premium ? (
                      <Users className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3 h-3 text-amber-500" />
                    )}
                    {t('grid.netplay')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ================= PREMIUM UPGRADE MODAL ================= */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="glass-premium border-purple-500/30 max-w-md">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <div className="mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full w-fit shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white mt-2">
              Upgrade para Panda Premium
            </DialogTitle>
            <DialogDescription className="text-zinc-300 text-sm">
              {upgradeFeature === 'netplay' 
                ? 'Jogue online com amigos via salas Netplay P2P e reviva clássicos juntos!' 
                : 'Sincronize automaticamente seus arquivos de saves (.sav) com a Nuvem Panda e jogue em qualquer plataforma.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 border-y border-zinc-900 my-2 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Saves na nuvem ilimitados</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Netplay de baixa latência unificado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Acesso antecipado a novos emuladores</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-col space-y-2 sm:space-x-0 w-full">
            <Button 
              onClick={handleUpgradeMock}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 shadow-lg shadow-purple-500/20"
            >
              Virar Premium (Demo Simulação)
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-zinc-200">
                Talvez mais tarde
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="glass-premium border-red-500/20 max-w-md">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="text-xl font-bold text-white">
              {t('delete.title')}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              {t('delete.desc', { title: gameToDelete?.title || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-col space-y-2 sm:space-x-0 w-full mt-4">
            <Button 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 cursor-pointer border border-red-500/30"
            >
              {isDeleting ? t('delete.deleting') : t('delete.confirm')}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isDeleting} className="w-full text-zinc-400 hover:text-zinc-200">
                {t('delete.cancel')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
