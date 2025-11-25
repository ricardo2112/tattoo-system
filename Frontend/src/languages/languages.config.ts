/**
 * i18n Configuration
 *
 * Internationalization setup using react-i18next
 * Supports: English (en), Spanish (es), Arabic (ar), Chinese (zh)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';

// Available languages
export const languages = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
} as const;

// i18n initialization
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'es', // default language
    fallbackLng: 'es', // fallback language
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // disable suspense for now
    },
  });

/**
 * Change language and update document direction for RTL languages
 */
export const changeLanguage = async (lang: keyof typeof languages) => {
  await i18n.changeLanguage(lang);
};

export default i18n;
