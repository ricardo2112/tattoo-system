import { Card } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import {
  UserGroupIcon,
  CalendarIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  buttonText: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Pacientes",
    description: "Información de pacientes",
    icon: UserGroupIcon,
    path: "/clientes",
    color: "bg-blue-500",
    buttonText: "Acceder",
  },
  {
    title: "Nueva Sesión",
    description: "Iniciar sesión de terapia",
    icon: CalendarIcon,
    path: "/citas",
    color: "bg-green-500",
    buttonText: "Iniciar",
  },
  {
    title: "Estadísticas",
    description: "Ver historial y estadísticas",
    icon: ChartBarIcon,
    path: "/estadisticas",
    color: "bg-purple-500",
    buttonText: "Visualizar",
  },
];

/**
 * Home page component
 * Main dashboard with quick actions and greeting
 */
export default function Home() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              Bienvenido de vuelta, {user?.nombre?.split(" ")[0]}
            </h1>
            <p className="text-primary-100">
              Gestiona tu estudio de tatuajes con eficiencia
            </p>
          </div>
          <SparklesIcon className="h-20 w-20 opacity-20" />
        </div>
      </div>

      {/* Menu Principal */}
      <div>
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Menu Principal
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="group relative overflow-hidden border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-lg ${action.color} bg-opacity-10 p-3`}
                  >
                    <action.icon
                      className={`h-8 w-8 ${action.color.replace("bg-", "text-")}`}
                    />
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {action.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>

                <Link
                  to={action.path}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-all duration-200 group-hover:gap-3 dark:text-primary-400"
                >
                  {action.buttonText}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-500/10 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
