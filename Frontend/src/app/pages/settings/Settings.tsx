/**
 * Settings Page
 *
 * Application settings page with theme and appearance configuration.
 * Demonstrates real-time preview of theme changes.
 */

import { useTranslation } from 'react-i18next';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../../stores';
import { Card, Badge } from '../../../components/ui';
import type { ThemeMode, PrimaryColor } from '../../../configs/theme.config';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { mode, primaryColor, setMode, setPrimaryColor } = useThemeStore();

  const themeModes: Array<{
    mode: ThemeMode;
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = [
    {
      mode: 'system',
      icon: <Monitor className="h-5 w-5" />,
      label: t('settings.system'),
      description: 'Automatically adapt to system preferences',
    },
    {
      mode: 'light',
      icon: <Sun className="h-5 w-5" />,
      label: t('settings.light'),
      description: 'Use light color scheme',
    },
    {
      mode: 'dark',
      icon: <Moon className="h-5 w-5" />,
      label: t('settings.dark'),
      description: 'Use dark color scheme',
    },
  ];

  const primaryColors: Array<{
    color: PrimaryColor;
    label: string;
    hex: string;
  }> = [
    { color: 'blue', label: t('settings.blue'), hex: '#3b82f6' },
    { color: 'purple', label: t('settings.purple'), hex: '#a855f7' },
    { color: 'green', label: t('settings.green'), hex: '#22c55e' },
    { color: 'orange', label: t('settings.orange'), hex: '#f97316' },
    { color: 'pink', label: t('settings.pink'), hex: '#ec4899' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Customize your application appearance and preferences
        </p>
      </div>

      {/* Appearance Settings */}
      <Card variant="elevated">
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <Palette className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t('settings.appearance')}
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize how the app looks and feels
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="space-y-8">
            {/* Theme Mode Selection */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                {t('settings.themeMode')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {themeModes.map((themeMode) => {
                  const isActive = mode === themeMode.mode;

                  return (
                    <button
                      key={themeMode.mode}
                      onClick={() => setMode(themeMode.mode)}
                      className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10'
                          : 'border-border bg-card hover:border-primary-300 hover:bg-accent'
                      }`}
                    >
                      {isActive && (
                        <Badge
                          variant="primary"
                          className="absolute right-2 top-2"
                        >
                          Active
                        </Badge>
                      )}
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {themeMode.icon}
                      </div>
                      <div>
                        <div
                          className={`font-semibold ${
                            isActive ? 'text-primary-600' : 'text-foreground'
                          }`}
                        >
                          {themeMode.label}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {themeMode.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Color Selection */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                {t('settings.primaryColor')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-5">
                {primaryColors.map((color) => {
                  const isActive = primaryColor === color.color;

                  return (
                    <button
                      key={color.color}
                      onClick={() => setPrimaryColor(color.color)}
                      className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10'
                          : 'border-border bg-card hover:border-gray-300 hover:bg-accent'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-600" />
                      )}
                      <div
                        className="h-10 w-10 rounded-full border-4 border-white shadow-md dark:border-gray-800"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'text-primary-600' : 'text-foreground'
                        }`}
                      >
                        {color.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Section */}
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Preview
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                    Primary Button
                  </button>
                  <button className="rounded-lg border-2 border-primary-600 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950">
                    Outline Button
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This preview shows how the selected theme and colors will look
                  throughout the application.
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;
