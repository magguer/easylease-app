import { useState, useEffect } from 'react';
import i18n, { loadSavedLanguage, changeLanguage as changeI18nLanguage, getCurrentLanguage, languageEmitter } from '@/lib/i18n';

type SupportedLanguage = 'en' | 'es';

/**
 * Custom hook for translations
 */
export const useTranslation = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Load saved language on mount
    const initLanguage = async () => {
      const savedLanguage = await loadSavedLanguage();
      setLanguage(savedLanguage as SupportedLanguage);
      setIsLoading(false);
    };
    initLanguage();

    // Listen for language changes
    const handleLanguageChange = (newLanguage: string) => {
      setLanguage(newLanguage as SupportedLanguage);
      forceUpdate({}); // Force re-render
    };

    languageEmitter.on('languageChanged', handleLanguageChange);

    // Cleanup listener on unmount
    return () => {
      languageEmitter.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    await changeI18nLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const t = (key: string, options?: object): string => {
    return i18n.t(key, options);
  };

  return {
    t,
    language,
    changeLanguage,
    isLoading,
    isEnglish: language === 'en',
    isSpanish: language === 'es',
  };
};
