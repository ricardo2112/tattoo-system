/**
 * Language Store - Zustand
 *
 * Manages application language/locale state:
 * - Current language selection
 * - Language persistence in localStorage
 * - Integration with i18next
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'es' | 'ar' | 'zh';

interface LanguageStore {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

/**
 * Language store with persistence
 * Automatically saves language preference to localStorage
 */
export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      currentLanguage: 'en',

      /**
       * Set current language
       * Should be called alongside i18next.changeLanguage()
       */
      setLanguage: (lang: Language) => {
        set({ currentLanguage: lang });
      },
    }),
    {
      name: 'language-storage',
      version: 1,
    }
  )
);
