import React, { createContext, useContext, useState } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'sidebar.subtitle': 'Sua Máquina de Jogos Retro',
    'sidebar.user': 'Usuário',
    'sidebar.free': 'Grátis',
    'sidebar.premium': 'Premium',
    'sidebar.toggle': 'Alternar',
    'sidebar.library': 'Biblioteca',
    'sidebar.netplay': 'Jogar Online',
    'sidebar.settings': 'Configurações',
    'sidebar.logout': 'Sair da Conta',
    'sidebar.exit': 'Sair',
    
    'library.title': 'Biblioteca de Jogos',
    'library.count': 'Você tem {count} ROMs locais carregadas.',
    'library.import': 'Importar ROM',
    'library.sync': 'Sincronizar Saves',
    'library.syncing': 'Sincronizando...',
    'library.toast.updated': 'Biblioteca Atualizada',
    'library.toast.removed': 'Jogo Removido',
    
    'grid.search': 'Pesquisar jogos na biblioteca...',
    'grid.all': 'Todos',
    'grid.last_played': 'Último save: {date}',
    'grid.never_played': 'Nunca jogado',
    'grid.play': 'Jogar',
    'grid.netplay': 'Netplay',
    'grid.delete': 'Excluir Jogo',
    'grid.no_games': 'Nenhum jogo encontrado com os filtros selecionados.',
    
    'settings.title': 'Configurações',
    'settings.description': 'Ajuste as preferências de vídeo, áudio e controles do Panda End.',
    'settings.general': 'Geral',
    'settings.general_desc': 'Configurações globais de emulação.',
    'settings.autosave': 'Salvar estado automaticamente ao sair',
    'settings.bridge': 'Status da Ponte: Conectado',
    'settings.language': 'Idioma',
    'settings.language_desc': 'Selecione o idioma de exibição do aplicativo.',
    'settings.lang.pt': 'Português',
    'settings.lang.en': 'English',
    'settings.lang.es': 'Español',
    
    'delete.title': 'Remover Jogo',
    'delete.desc': 'Tem certeza que deseja remover {title} da sua biblioteca? Esta ação deletará a ROM e o arquivo de save permanentemente do disco.',
    'delete.confirm': 'Sim, remover jogo',
    'delete.deleting': 'Removendo...',
    'delete.cancel': 'Cancelar',
    'delete.fail': 'Falha ao remover o jogo. Tente novamente.',
  },
  en: {
    'sidebar.subtitle': 'Your Retro Gaming Engine',
    'sidebar.user': 'User',
    'sidebar.free': 'Free',
    'sidebar.premium': 'Premium',
    'sidebar.toggle': 'Toggle',
    'sidebar.library': 'Library',
    'sidebar.netplay': 'Play Online',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Log Out',
    'sidebar.exit': 'Exit',
    
    'library.title': 'Game Library',
    'library.count': 'You have {count} local ROMs loaded.',
    'library.import': 'Import ROM',
    'library.sync': 'Sync Saves',
    'library.syncing': 'Syncing...',
    'library.toast.updated': 'Library Updated',
    'library.toast.removed': 'Game Removed',
    
    'grid.search': 'Search games in library...',
    'grid.all': 'All',
    'grid.last_played': 'Last save: {date}',
    'grid.never_played': 'Never played',
    'grid.play': 'Play',
    'grid.netplay': 'Netplay',
    'grid.delete': 'Delete Game',
    'grid.no_games': 'No games found with the selected filters.',
    
    'settings.title': 'Settings',
    'settings.description': 'Adjust video, audio, and controller preferences for Panda End.',
    'settings.general': 'General',
    'settings.general_desc': 'Global emulation settings.',
    'settings.autosave': 'Auto-save state on exit',
    'settings.bridge': 'Bridge Status: Connected',
    'settings.language': 'Language',
    'settings.language_desc': 'Select the application display language.',
    'settings.lang.pt': 'Português',
    'settings.lang.en': 'English',
    'settings.lang.es': 'Español',
    
    'delete.title': 'Remove Game',
    'delete.desc': 'Are you sure you want to remove {title} from your library? This action will permanently delete the ROM and save file from disk.',
    'delete.confirm': 'Yes, remove game',
    'delete.deleting': 'Removing...',
    'delete.cancel': 'Cancel',
    'delete.fail': 'Failed to remove game. Try again.',
  },
  es: {
    'sidebar.subtitle': 'Tu Motor de Juegos Retro',
    'sidebar.user': 'Usuario',
    'sidebar.free': 'Gratis',
    'sidebar.premium': 'Premium',
    'sidebar.toggle': 'Cambiar',
    'sidebar.library': 'Biblioteca',
    'sidebar.netplay': 'Jugar Online',
    'sidebar.settings': 'Configuración',
    'sidebar.logout': 'Cerrar Sesión',
    'sidebar.exit': 'Salir',
    
    'library.title': 'Biblioteca de Juegos',
    'library.count': 'Tienes {count} ROMs locales cargadas.',
    'library.import': 'Importar ROM',
    'library.sync': 'Sincronizar Saves',
    'library.syncing': 'Sincronizando...',
    'library.toast.updated': 'Biblioteca Actualizada',
    'library.toast.removed': 'Juego Eliminado',
    
    'grid.search': 'Buscar juegos en la biblioteca...',
    'grid.all': 'Todos',
    'grid.last_played': 'Último save: {date}',
    'grid.never_played': 'Nunca jugado',
    'grid.play': 'Jugar',
    'grid.netplay': 'Netplay',
    'grid.delete': 'Eliminar Juego',
    'grid.no_games': 'No se encontraron juegos con los filtros seleccionados.',
    
    'settings.title': 'Configuración',
    'settings.description': 'Ajusta las preferencias de video, audio y controles de Panda End.',
    'settings.general': 'General',
    'settings.general_desc': 'Configuraciones globales de emulación.',
    'settings.autosave': 'Guardar estado automáticamente al salir',
    'settings.bridge': 'Estado del Puente: Conectado',
    'settings.language': 'Idioma',
    'settings.language_desc': 'Seleccione el idioma de visualización de la aplicación.',
    'settings.lang.pt': 'Português',
    'settings.lang.en': 'English',
    'settings.lang.es': 'Español',
    
    'delete.title': 'Eliminar Juego',
    'delete.desc': '¿Estás seguro de que quieres eliminar {title} de tu biblioteca? Esta acción borrará la ROM y el archivo de guardado permanentemente del disco.',
    'delete.confirm': 'Sí, eliminar juego',
    'delete.deleting': 'Eliminando...',
    'delete.cancel': 'Cancelar',
    'delete.fail': 'Error al eliminar el juego. Inténtalo de nuevo.',
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('panda_language');
    if (saved === 'pt' || saved === 'en' || saved === 'es') {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'pt' || browserLang === 'es') {
      return browserLang as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('panda_language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
