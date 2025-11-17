/**
 * Theme Store - Zustand
 *
 * Manages application theme state including:
 * - Theme mode (light, dark, system)
 * - Primary color selection
 * - Theme persistence in localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, type ThemeMode, type PrimaryColor } from '../configs/theme.config';

interface ThemeStore {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  initTheme: () => void;
}

/**
 * Theme store with persistence
 * Automatically saves theme preferences to localStorage
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      primaryColor: 'blue',

      /**
       * Set theme mode (light, dark, or system)
       */
      setMode: (mode: ThemeMode) => {
        set({ mode });
        const { primaryColor } = get();
        applyTheme(mode, primaryColor);
      },

      /**
       * Set primary color
       */
      setPrimaryColor: (color: PrimaryColor) => {
        set({ primaryColor: color });
        const { mode } = get();
        applyTheme(mode, color);
      },

      /**
       * Initialize theme on app load
       * Applies saved theme or defaults
       */
      initTheme: () => {
        const { mode, primaryColor } = get();
        applyTheme(mode, primaryColor);

        // Watch for system theme changes if mode is 'system'
        if (mode === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = () => {
            applyTheme('system', primaryColor);
          };
          mediaQuery.addEventListener('change', handler);
        }
      },
    }),
    {
      name: 'theme-storage',
      version: 1,
    }
  )
);
