import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { es, TranslationKey } from './es';
import { en } from './en';

export type Language = 'es' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const translations: Record<Language, Record<TranslationKey, string>> = {
  es,
  en,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('obraservice_lang');
      if (saved === 'es' || saved === 'en') return saved;
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obraservice_lang', lang);
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || es;
    return dict[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: (key: TranslationKey, fallback?: string) => es[key] || fallback || key,
    };
  }
  return context;
};
