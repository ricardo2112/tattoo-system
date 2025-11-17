/**
 * Sidebar Component
 *
 * Application sidebar with navigation menu.
 * Supports collapsible state and route highlighting.
 *
 * @example
 * ```tsx
 * <Sidebar isOpen={isSidebarOpen} onToggle={handleToggle} />
 * ```
 */

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );

  // Navigation menu structure
  const menuItems: Array<{ group?: string; items: MenuItem[] }> = [
    {
      items: [
        {
          key: 'clientes',
          label: 'Clientes',
          icon: <Users className="h-5 w-5" />,
          path: '/clientes',
        },
        {
          key: 'tatuajes',
          label: 'Tatuajes',
          icon: <Layers className="h-5 w-5" />,
          path: '/tatuajes',
        },
      ],
    },
  ];

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {isOpen && (
            <h1 className="text-xl font-bold text-primary-600">Tattoo System</h1>
          )}
          <button
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.group && isOpen && (
                <button
                  onClick={() => toggleGroup(section.group!)}
                  className="w-full px-3 py-2 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground text-left flex items-center justify-between"
                >
                  <span>{section.group}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      expandedGroups.has(section.group!) ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )}

              {(!section.group || expandedGroups.has(section.group)) && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-foreground hover:bg-accent'
                        }`
                      }
                      title={!isOpen ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {isOpen && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Settings link at bottom */}
        <div className="border-t border-border p-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-foreground hover:bg-accent'
              }`
            }
            title={!isOpen ? t('navigation.settings') : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>{t('navigation.settings')}</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
