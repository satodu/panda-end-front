import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import DashboardLayout from './components/layout/DashboardLayout'
import LibraryView from './views/LibraryView'
import NetplayView from './views/NetplayView'
import LoginView from './views/LoginView'
import EmulatorContainer from './components/game/EmulatorContainer'
import { Globe, ShieldCheck } from 'lucide-react'

interface Game {
  id: string;
  title: string;
  system: string;
  romUrl: string;
  coverUrl: string;
}

function SettingsView() {
  const { t, language, setLanguage } = useLanguage();

  const languages = [
    { code: 'pt' as const, flag: '🇧🇷', label: t('settings.lang.pt') },
    { code: 'en' as const, flag: '🇺🇸', label: t('settings.lang.en') },
    { code: 'es' as const, flag: '🇪🇸', label: t('settings.lang.es') },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          {t('settings.title')}
        </h1>
        <p className="text-zinc-400 mt-1 mb-6">{t('settings.description')}</p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-6">

        {/* General */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">{t('settings.general')}</h3>
          <p className="text-sm text-zinc-400 mb-4">{t('settings.general_desc')}</p>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-zinc-900"
            />
            <span className="text-sm text-zinc-200">{t('settings.autosave')}</span>
          </label>
        </div>

        <hr className="border-zinc-800" />

        {/* Language Selector */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Globe className="w-4 h-4 text-purple-400" />
            <h3 className="text-lg font-semibold text-zinc-100">{t('settings.language')}</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">{t('settings.language_desc')}</p>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  language === lang.code
                    ? 'bg-purple-600/15 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-zinc-800" />

        {/* NativePHP Bridge Status */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-lg font-semibold text-zinc-100">NativePHP</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('settings.bridge')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainAppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'library' | 'netplay' | 'settings'>('library');
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  if (!user) {
    return <LoginView />;
  }

  if (activeGame) {
    return (
      <EmulatorContainer
        game={activeGame}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'library' && (
        <LibraryView onLaunchGame={(game) => setActiveGame(game)} />
      )}
      {currentTab === 'netplay' && (
        <NetplayView />
      )}
      {currentTab === 'settings' && (
        <SettingsView />
      )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}
