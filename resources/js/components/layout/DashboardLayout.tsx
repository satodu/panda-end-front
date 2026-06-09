import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Gamepad2, 
  Users, 
  Settings, 
  LogOut, 
  Sparkles,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: 'library' | 'netplay' | 'settings';
  setCurrentTab: (tab: 'library' | 'netplay' | 'settings') => void;
}

export default function DashboardLayout({ 
  children, 
  currentTab, 
  setCurrentTab 
}: DashboardLayoutProps) {
  const { user, logout, togglePremium } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'library',   label: t('sidebar.library'),  icon: Gamepad2 },
    { id: 'netplay',   label: t('sidebar.netplay'),  icon: Users },
    { id: 'settings',  label: t('sidebar.settings'), icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md p-6 justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/panda-end-icon.png" 
              alt="Panda End" 
              className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-purple-500/20"
            />
            <div>
              <h1 className="font-bold text-lg text-zinc-50 leading-none">Panda End</h1>
              <span className="text-[10px] text-zinc-500 font-medium leading-tight">{t('sidebar.subtitle')}</span>
            </div>
          </div>

          {/* User Account Card */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3">
            <div className="overflow-hidden">
              <p className="text-xs text-zinc-500 font-semibold truncate uppercase tracking-wider">{t('sidebar.user')}</p>
              <p className="text-sm font-medium text-zinc-200 truncate mt-0.5" title={user?.email}>
                {user?.email}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              {user?.is_premium ? (
                <Badge variant="premium" className="gap-1 text-[10px] py-0.5 px-2">
                  <Sparkles className="w-2.5 h-2.5" /> {t('sidebar.premium')}
                </Badge>
              ) : (
                <Badge variant="free" className="text-[10px] py-0.5 px-2">
                  {t('sidebar.free')}
                </Badge>
              )}

              {/* Quick toggle for premium status (ideal for testing) */}
              <button 
                onClick={togglePremium}
                className="text-[10px] text-zinc-500 hover:text-purple-400 transition-colors underline"
                title="Alternar plano para testar bloqueios"
              >
                {t('sidebar.toggle')}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-600/10 text-purple-400 border-l-2 border-purple-500 pl-3' 
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-950/20 gap-2 px-3"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('sidebar.logout')}</span>
          </Button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav 
        style={{ paddingBottom: 'calc(var(--inset-bottom, env(safe-area-inset-bottom, 0px)) + 0.5rem)' }}
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md z-40 px-4 pt-2 flex items-center justify-around shadow-2xl"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
                isActive ? 'text-purple-400' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center py-1.5 px-3 text-zinc-500 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">{t('sidebar.exit')}</span>
        </button>
      </nav>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/panda-end-icon.png" 
              alt="Panda End" 
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-zinc-50">Panda End</span>
          </div>
          <div className="flex items-center space-x-2">
            {user?.is_premium ? (
              <Badge variant="premium" className="text-[9px] py-0.5 px-1.5 gap-0.5">
                <Sparkles className="w-2 h-2" /> {t('sidebar.premium')}
              </Badge>
            ) : (
              <Badge variant="free" className="text-[9px] py-0.5 px-1.5">
                {t('sidebar.free')}
              </Badge>
            )}
            <button 
              onClick={togglePremium} 
              className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 py-0.5 px-2 rounded-md hover:bg-zinc-900/80"
            >
              {t('sidebar.toggle')}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}
