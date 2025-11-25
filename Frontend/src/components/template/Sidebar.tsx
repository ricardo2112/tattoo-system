import { NavLink } from "react-router";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Inicio", path: "/dashboards/home", icon: HomeIcon },
  { name: "Clientes", path: "/clientes", icon: UserGroupIcon },
  { name: "Citas", path: "/citas", icon: CalendarIcon },
  { name: "Tatuajes", path: "/tatuajes", icon: SparklesIcon },
  { name: "Estadísticas", path: "/estadisticas", icon: ChartBarIcon },
  { name: "Configuración", path: "/settings/general", icon: Cog6ToothIcon },
];

/**
 * Sidebar component with premium navigation
 * Provides main navigation menu for the tattoo studio app
 */
export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-gray-200/50 bg-primary-600 backdrop-blur-sm dark:border-gray-800/50">
      <nav className="flex h-full flex-col gap-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
