/**
 * Header Component
 *
 * Application header with language selector and theme toggle.
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */

import { Bell, Search } from 'lucide-react';
import LanguageSelector from '../../components/common/LanguageSelector';
import ThemeToggle from '../../components/common/ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search bar */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User profile */}
          <button className="flex items-center gap-2 rounded-lg hover:bg-accent px-3 py-2 transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
            <span className="hidden md:inline text-sm font-medium text-foreground">
              John Doe
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
