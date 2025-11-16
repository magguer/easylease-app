import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'eventemitter3';

// Import translations
import en from './i18n/locales/en.json';
import es from './i18n/locales/es.json';

const i18n = new I18n({
  en,
  es,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

// When a value is missing from a language it'll fall back to another language with the key present
i18n.enableFallback = true;

// Default language
i18n.defaultLocale = 'en';

// Storage keys
const STORAGE_LANGUAGE_KEY = '@easylease_language';

// Event emitter for language changes
export const languageEmitter = new EventEmitter();

/**
 * Load saved language preference
 */
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_LANGUAGE_KEY);
    if (savedLanguage) {
      i18n.locale = savedLanguage;
      return savedLanguage;
    }
    // If no saved language, use device language
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    i18n.locale = deviceLanguage;
    return deviceLanguage;
  } catch (error) {
    console.error('Error loading language:', error);
    return 'en';
  }
};

/**
 * Change app language
 */
export const changeLanguage = async (language: 'en' | 'es'): Promise<void> => {
  try {
    i18n.locale = language;
    await AsyncStorage.setItem(STORAGE_LANGUAGE_KEY, language);
    // Emit event to notify listeners
    languageEmitter.emit('languageChanged', language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

/**
 * Translation function
 */
export const t = (key: string, options?: object): string => {
  return i18n.t(key, options);
};

export default i18n;
