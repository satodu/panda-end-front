import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginView() {
  const { login, register, loginAsGuest } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (e: any) {
      setError(e.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 relative overflow-hidden select-none">
      
      {/* Background Neon Glow Circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none -z-10"></div>

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in">
        
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/images/panda-end-logo-transparent.png" 
            alt="Panda End Logo" 
            className="h-28 object-contain mb-4 drop-shadow-[0_0_25px_rgba(147,51,234,0.25)]"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">Panda End</h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">O Frontend Definitivo de Emulação Retro</p>
        </div>

        {/* Auth Card */}
        <Card className="glass border-zinc-850 shadow-2xl relative">
          
          {/* Accent Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-t-xl"></div>
          
          <CardHeader className="space-y-1 pt-8 text-center">
            <CardTitle className="text-xl font-bold text-zinc-50">
              {isRegistering ? 'Criar nova conta' : 'Entrar no Panda End'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isRegistering 
                ? 'Inscreva-se hoje para salvar seus jogos na nuvem.' 
                : 'Insira seu email para sincronizar sua biblioteca.'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              
              {error && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="nome@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Senha</label>
                  {!isRegistering && (
                    <a href="#" className="text-[10px] text-purple-400 hover:underline">Esqueceu a senha?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 shadow-lg shadow-purple-500/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <span>{isRegistering ? 'Registrar' : 'Entrar na Conta'}</span>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline"
                onClick={loginAsGuest}
                className="w-full border-zinc-850 text-zinc-300 hover:text-white"
              >
                Entrar como Convidado (Guest)
              </Button>

              {/* Test Tip Banner */}
              <div className="bg-purple-950/20 border border-purple-900/30 p-3 rounded-lg w-full flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-purple-300 leading-normal">
                  <strong>Dica de teste:</strong> Use o e-mail <strong>premium@panda.com</strong> para entrar automaticamente com privilégios Premium ativados!
                </p>
              </div>

              <div className="text-xs text-center text-zinc-500">
                {isRegistering ? (
                  <span>
                    Já possui conta?{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(false)} 
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      Entrar
                    </button>
                  </span>
                ) : (
                  <span>
                    Novo no Panda End?{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(true)} 
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      Criar Conta
                    </button>
                  </span>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
