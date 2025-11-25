import { useAuthContext } from "@/app/contexts/auth/context";
import { useThemeContext } from "@/app/contexts/theme/context";
import { useLocaleContext } from "@/app/contexts/locale/context";
import { Avatar } from "@/components/ui";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface ThemeOption {
  value: "light" | "dark" | "system";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LanguageOption {
  id: number;
  code: string;
  name: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { id: 1, code: "es", name: "Español", flag: "🇪🇸" },
  { id: 2, code: "en", name: "English", flag: "🇺🇸" },
];

/**
 * Header component with user greeting and theme selector
 */
export default function Header() {
  const { user } = useAuthContext();
  const { themeMode, setThemeMode } = useThemeContext();
  const { locale, setLocale } = useLocaleContext();
  const { t } = useTranslation();

  const themeOptions: ThemeOption[] = [
    { value: "light", label: t("theme.light"), icon: SunIcon },
    { value: "dark", label: t("theme.dark"), icon: MoonIcon },
    { value: "system", label: t("theme.system"), icon: ComputerDesktopIcon },
  ];

  const selectedLanguage = languageOptions.find(lang => lang.code === locale) || languageOptions[0];
  const currentTheme = themeOptions.find(opt => opt.value === themeMode) || themeOptions[0];

  const handleLanguageChange = (language: LanguageOption) => {
    setLocale(language.code);
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-40 border-b border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("app.name")}
            </span>
          </div>
        </div>

        {/* User info, language and theme selector */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <Listbox value={selectedLanguage} onChange={handleLanguageChange}>
            {({ open }) => (
              <div className="relative">
                <ListboxButton
                  className={clsx(
                    "relative w-35 cursor-pointer rounded-lg border py-2 pl-3 pr-8 text-start outline-none transition-colors focus:outline-none",
                    open
                      ? "border-primary-600 dark:border-primary-500"
                      : "border-gray-300 bg-white hover:border-gray-400 dark:border-dark-600 dark:bg-dark-700 dark:hover:border-dark-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedLanguage.flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {selectedLanguage.name}
                    </span>
                  </div>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400 dark:text-dark-300"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <ListboxOptions className="absolute right-0 z-10 mt-2 w-40 overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-none dark:border-dark-500 dark:bg-dark-750 dark:shadow-none">
                    {languageOptions.map((language) => (
                      <ListboxOption
                        key={language.id}
                        className={({ selected, focus }) =>
                          clsx(
                            "relative cursor-pointer select-none px-4 py-2 outline-none transition-colors",
                            focus && !selected && "bg-gray-100 dark:bg-dark-600",
                            selected
                              ? "bg-primary-600 text-white dark:bg-primary-500"
                              : "text-gray-800 dark:text-dark-100"
                          )
                        }
                        value={language}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{language.flag}</span>
                          <span className="text-sm font-medium">{language.name}</span>
                        </div>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            )}
          </Listbox>

          {/* Theme Selector */}
          <Listbox value={currentTheme} onChange={(theme) => setThemeMode(theme.value)}>
            {({ open }) => (
              <div className="relative">
                <ListboxButton
                  className={clsx(
                    "relative w-35 cursor-pointer rounded-lg border py-3 pl-3 pr-8 text-start outline-none transition-colors focus:outline-none",
                    open
                      ? "border-primary-600 dark:border-primary-500"
                      : "border-gray-300 bg-white hover:border-gray-400 dark:border-dark-600 dark:bg-dark-700 dark:hover:border-dark-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <currentTheme.icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentTheme.label}
                    </span>
                  </div>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400 dark:text-dark-300"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <ListboxOptions className="absolute right-0 z-10 mt-2 w-40 overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-none dark:border-dark-500 dark:bg-dark-750 dark:shadow-none">
                    {themeOptions.map((theme) => (
                      <ListboxOption
                        key={theme.value}
                        className={({ selected, focus }) =>
                          clsx(
                            "relative cursor-pointer select-none px-4 py-2 outline-none transition-colors",
                            focus && !selected && "bg-gray-100 dark:bg-dark-600",
                            selected
                              ? "bg-primary-600 text-white dark:bg-primary-500"
                              : "text-gray-800 dark:text-dark-100"
                          )
                        }
                        value={theme}
                      >
                        <div className="flex items-center gap-2">
                          <theme.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </div>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            )}
          </Listbox>

          <Avatar initialVariant="soft" initialColor="primary" name="Ricardo Becerra" />
        </div>
      </div>
    </header>
  );
}
