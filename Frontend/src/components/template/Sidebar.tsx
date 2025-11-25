import { NavLink, useLocation } from "react-router";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  CubeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@/components/ui";
import appLogo from "@/assets/appLogo.png";
import { useTranslation } from "react-i18next";

interface NavItem {
  nameKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: "main" | "management" | "settings";
}

/**
 * Sidebar component with premium navigation
 * Provides main navigation menu for the tattoo studio app
 */
export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation: NavItem[] = [
    { nameKey: "navigation.items.home", path: "/modules/home", icon: HomeIcon, category: "main" },
    { nameKey: "navigation.items.appointments", path: "/modules/citas", icon: CalendarIcon, category: "main" },
    { nameKey: "navigation.items.clients", path: "/modules/clientes", icon: UsersIcon, category: "main" },
    { nameKey: "navigation.items.tattoos", path: "/modules/tatuajes", icon: SparklesIcon, category: "main" },
    { nameKey: "navigation.items.piercings", path: "/modules/piercings", icon: SparklesIcon, category: "main" },
    { nameKey: "navigation.items.laserRemoval", path: "/modules/laser", icon: SparklesIcon, category: "main" },
    { nameKey: "navigation.items.inventory", path: "/modules/inventario", icon: CubeIcon, category: "management" },
    { nameKey: "navigation.items.finances", path: "/modules/finanzas", icon: CurrencyDollarIcon, category: "management" },
    { nameKey: "navigation.items.users", path: "/modules/usuarios", icon: UsersIcon, category: "management" },
    { nameKey: "navigation.items.settings", path: "/settings/general", icon: Cog6ToothIcon, category: "settings" },
  ];

  // Group navigation items by category
  const groupedNav = navigation.reduce((acc, item) => {
    const category = item.category || "main";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Determine which accordion should be open by default based on current route
  const getDefaultValue = () => {
    const currentPath = location.pathname;
    for (const [category, items] of Object.entries(groupedNav)) {
      if (items.some(item => currentPath.startsWith(item.path))) {
        return category;
      }
    }
    return "main";
  };

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-gray-200 bg-white shadow-sm dark:border-dark-600 dark:bg-dark-800">
      <div className="flex h-full flex-col overflow-y-auto">
        {/* Logo */}
        <div className="border-b border-gray-200 px-5 py-6 dark:border-dark-600">
          <img
            src={appLogo}
            alt="Tattoo Z Studio"
            className="mx-auto h-auto w-44"
          />
        </div>

        <nav className="flex-1 p-4">
          <Accordion
            defaultValue={getDefaultValue()}
            className="flex flex-col gap-2"
          >
            {Object.entries(groupedNav).map(([category, items]) => (
              <AccordionItem key={category} value={category}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider text-gray-700 outline-none ring-primary-500/50 ring-offset-2 ring-offset-white hover:bg-gray-50 focus-visible:ring dark:text-gray-300 dark:ring-offset-dark-800 dark:hover:bg-dark-700">
                  {({ open }) => (
                    <>
                      <span className="text-xs">
                        {t(`navigation.categories.${category}`)}
                      </span>
                      <ChevronDownIcon
                        className={clsx(
                          "h-5 w-5 text-gray-400 transition-transform duration-300 dark:text-dark-300",
                          open && "-rotate-180"
                        )}
                      />
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="mt-1 space-y-1">
                  {items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        clsx(
                          "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium tracking-wide outline-hidden transition-all duration-200",
                          isActive
                            ? "bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/30 dark:text-primary-400"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:text-dark-200 dark:hover:bg-dark-700 dark:hover:text-dark-50 dark:focus:bg-dark-700 dark:focus:text-dark-50"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={clsx(
                              "h-5 w-5 stroke-[1.5] transition-all duration-200",
                              isActive
                                ? "text-primary-600 dark:text-primary-500"
                                : "text-gray-400 group-hover:text-gray-600 group-focus:text-gray-600 dark:text-dark-400 dark:group-hover:text-dark-200 dark:group-focus:text-dark-200"
                            )}
                          />
                          <span
                            className={clsx(
                              "transition-all duration-200",
                              isActive && "font-semibold"
                            )}
                          >
                            {t(item.nameKey)}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 dark:border-dark-600">
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {t("app.name")}
          </p>
        </div>
      </div>
    </aside>
  );
}
