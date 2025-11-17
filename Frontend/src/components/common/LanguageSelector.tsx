/**
 * LanguageSelector Component
 *
 * Dropdown selector for changing the application language.
 * Integrates with i18next and language store.
 *
 * @example
 * ```tsx
 * <LanguageSelector />
 * ```
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore, type Language } from '../../stores';
import { languages, changeLanguage } from '../../i18n';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (lang: Language) => {
    await changeLanguage(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = languages[currentLanguage];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <span className="text-xl sm:hidden">{currentLang.flag}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg animate-fade-in z-50">
          <div className="py-1">
            {Object.entries(languages).map(([code, lang]) => {
              const isActive = code === currentLanguage;

              return (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code as Language)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
