/**
 * Theme Configuration
 *
 * This file contains all theme-related configurations including:
 * - Light and dark mode color schemes
 * - Primary color palettes (blue, purple, green, orange, pink)
 * - Semantic color tokens for consistent theming
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type PrimaryColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

/**
 * Primary color palettes
 * Each color has shades from 50 (lightest) to 950 (darkest)
 */
export const primaryColors: Record<PrimaryColor, Record<string, string>> = {
  blue: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554',
  },
  purple: {
    '50': '#faf5ff',
    '100': '#f3e8ff',
    '200': '#e9d5ff',
    '300': '#d8b4fe',
    '400': '#c084fc',
    '500': '#a855f7',
    '600': '#9333ea',
    '700': '#7e22ce',
    '800': '#6b21a8',
    '900': '#581c87',
    '950': '#3b0764',
  },
  green: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
    '950': '#052e16',
  },
  orange: {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
    '950': '#431407',
  },
  pink: {
    '50': '#fdf2f8',
    '100': '#fce7f3',
    '200': '#fbcfe8',
    '300': '#f9a8d4',
    '400': '#f472b6',
    '500': '#ec4899',
    '600': '#db2777',
    '700': '#be185d',
    '800': '#9d174d',
    '900': '#831843',
    '950': '#500724',
  },
};

/**
 * Theme configurations for light and dark modes
 * Uses semantic color tokens for easy theming
 */
export const themes = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#3b82f6',
    radius: '0.5rem',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f1f5f9',
    card: '#1e293b',
    cardForeground: '#f1f5f9',
    popover: '#1e293b',
    popoverForeground: '#f1f5f9',
    muted: '#334155',
    mutedForeground: '#94a3b8',
    accent: '#334155',
    accentForeground: '#f1f5f9',
    destructive: '#dc2626',
    destructiveForeground: '#f1f5f9',
    border: '#334155',
    input: '#334155',
    ring: '#3b82f6',
    radius: '0.5rem',
  },
};

/**
 * Apply theme to document root
 * This function sets CSS variables on the :root element
 */
export const applyTheme = (mode: ThemeMode, primaryColor: PrimaryColor): void => {
  const root = document.documentElement;

  // Determine actual mode (handle 'system' preference)
  let actualMode: 'light' | 'dark' = mode === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : mode;

  // Apply dark/light class to root element
  if (actualMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply semantic theme colors
  const themeColors = themes[actualMode];
  Object.entries(themeColors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssKey}`, value);
  });

  // Apply primary color palette
  const palette = primaryColors[primaryColor];
  Object.entries(palette).forEach(([shade, color]) => {
    root.style.setProperty(`--primary-${shade}`, color);
  });
};

/**
 * Listen to system theme changes when mode is 'system'
 */
export const watchSystemTheme = (
  callback: (isDark: boolean) => void
): (() => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handler);

  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handler);
};

export default {
  primaryColors,
  themes,
  applyTheme,
  watchSystemTheme,
};
