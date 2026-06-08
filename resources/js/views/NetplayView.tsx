import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNativePHP } from '@/hooks/useNativePHP';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
import { Users, Lock, Plus, ArrowRight, Loader2, Sparkles, Wifi } from 'lucide-react';

export default function NetplayView() {
  const { user, togglePremium } = useAuth();
  const { createNetplayRoom } = useNativePHP();
  
  const [roomCode, setRoomCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCreateRoom = async () => {
    if (!user?.is_premium) {
      setShowUpgrade(true);
      return;
    }

    setIsCreating(true);
    try {
      const result = await createNetplayRoom('any');
      setActiveRoom(result.roomCode);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode) return;

    setIsJoining(true);
    // Simulate peer connection latency
    setTimeout(() => {
      setIsJoining(false);
      setActiveRoom(roomCode.toUpperCase());
    }, 1500);
  };

  const handleUpgradeMock = () => {
    togglePremium();
    setShowUpgrade(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Netplay Multiplayer
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Jogue cooperativo ou contra outros jogadores online sincronizando o core dos emuladores.
        </p>
      </div>

      {activeRoom ? (
        // Active multiplayer Lobby
        <Card className="glass border-purple-500/20 max-w-2xl mx-auto shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-xl"></div>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
              <Wifi className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-50">Lobby Conectado</CardTitle>
            <CardDescription>Aguardando o Host iniciar a ROM selecionada...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 text-center">
            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl inline-block">
              <span className="text-xs font-semibold text-zinc-500 block uppercase tracking-widest">Código da Sala</span>
              <span className="text-4xl font-extrabold text-white tracking-widest block mt-2 font-mono select-all">
                {activeRoom}
              </span>
            </div>

            <div className="text-xs text-zinc-400">
              Compartilhe o código acima para que outros jogadores possam se conectar à sua WebView.
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setActiveRoom(null)}
                className="text-xs font-semibold"
              >
                Desconectar da Sala
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Main Netplay Dashboard Controls
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create Room Card */}
          <Card className="flex flex-col justify-between border-zinc-850 hover:border-zinc-800 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 bg-purple-950/20 border border-purple-900/20 rounded-lg flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle className="text-lg font-bold">Criar Sala de Jogo</CardTitle>
              <CardDescription>Inicie um servidor P2P local e convide um segundo player para jogar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Você será o Host principal. O emulador rodará a ROM local no seu NativePHP e transmitirá os inputs de controle do Player 2 de forma sincronizada.
              </p>
              
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full gap-2 text-xs font-semibold"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : user?.is_premium ? (
                  <Users className="w-4 h-4 text-white" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                )}
                Criar Sala de Netplay
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="flex flex-col justify-between border-zinc-850 hover:border-zinc-800 transition-all duration-300">
            <CardHeader>
              <div className="w-10 h-10 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-center mb-2">
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </div>
              <CardTitle className="text-lg font-bold">Entrar em uma Sala</CardTitle>
              <CardDescription>Conecte-se a uma sala existente fornecida por um amigo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold">Código da Sala</label>
                  <Input
                    placeholder="Ex: PANDA-A4F9"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-850 uppercase tracking-widest font-mono text-center"
                    disabled={isJoining}
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={isJoining || !roomCode}
                  className="w-full gap-2 text-xs font-semibold border-zinc-800 hover:border-zinc-700"
                >
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <span>Entrar no Lobby</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ================= NETPLAY MULTIPLAYER UPGRADE MODAL ================= */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="glass-premium border-purple-500/30 max-w-md">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <div className="mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full w-fit shadow-lg shadow-purple-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white mt-2">
              Jogue Online com Netplay
            </DialogTitle>
            <DialogDescription className="text-zinc-300 text-sm">
              Criar salas de lobbies retro e transmitir sessões com latência ultra-baixa são recursos premium.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 border-y border-zinc-900 my-2 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Multiplayer P2P sem necessidade de portas abertas</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Chat de voz in-game sincronizado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-zinc-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Lista de amigos integrados na nuvem</span>
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
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
