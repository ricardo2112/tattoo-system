/**
 * ThemeToggle Component
 *
 * Allows users to switch between light, dark, and system themes.
 * Integrates with the theme store for persistence.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores';
import type { ThemeMode } from '../../configs/theme.config';

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  const themes: Array<{ mode: ThemeMode; icon: React.ReactNode; label: string }> = [
    { mode: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
    { mode: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { mode: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  ];

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-background p-1">
      {themes.map((theme) => {
        const isActive = mode === theme.mode;

        return (
          <button
            key={theme.mode}
            onClick={() => setMode(theme.mode)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            aria-label={`Switch to ${theme.label} theme`}
            aria-pressed={isActive}
          >
            {theme.icon}
            <span className="hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
