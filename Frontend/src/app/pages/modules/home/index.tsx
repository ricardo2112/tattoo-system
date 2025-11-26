import { Card } from "@/components/ui";
import { Page } from "@/components/shared/Page";
import { useAuthContext } from "@/app/contexts/auth/context";
import {

  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { GiSkullRing, GiSkullWithSyringe, GiTripleSkulls } from "react-icons/gi";
import { LiaSkullSolid } from "react-icons/lia";

interface QuickAction {
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  buttonKey: string;
}

/**
 * Home page component
 * Main dashboard with quick actions and greeting
 */
export default function Home() {
  const { user } = useAuthContext();
  const { t } = useTranslation();

  const quickActions: QuickAction[] = [
    {
      titleKey: "modules.home.quickActions.clients.title",
      descriptionKey: "modules.home.quickActions.clients.description",
      icon: GiTripleSkulls,
      path: "modules/clientes",
      color: "bg-primary",
      buttonKey: "modules.home.quickActions.clients.button",
    },
    {
      titleKey: "modules.home.quickActions.newSession.title",
      descriptionKey: "modules.home.quickActions.newSession.description",
      icon: GiSkullWithSyringe,
      path: "modules/tatuajes",
      color: "bg-secundary",
      buttonKey: "modules.home.quickActions.newSession.button",
    },
    {
      titleKey: "modules.home.quickActions.statistics.title",
      descriptionKey: "modules.home.quickActions.statistics.description",
      icon: GiSkullRing,
      path: "modules/piercings",
      color: "bg-neutral",
      buttonKey: "modules.home.quickActions.statistics.button",
    },
  ];

  return (
    <Page title={t("navigation.items.home")}>
      {/* Welcome section - Full width, pegado al header */}
      <div className="border-b border-gray-200 bg-primary-900 py-10 px-6 text-white dark:border-dark-700 dark:bg-primary-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight">
              {t("common.welcome")}, {user?.nombre?.split(" ")[0]}
            </h1>
            <p className="text-lg font-medium text-primary-100">
              {t("app.tagline")}
            </p>
          </div>
          <LiaSkullSolid className="h-24 w-24 text-white/30" />
        </div>
      </div>

      {/* Menu Principal */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {t("modules.home.mainMenu")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-xl ${action.color} bg-opacity-10 p-4`}
                  >
                    <action.icon
                      className={`h-12 w-12 ${action.color.replace("bg-", "text-")}`}
                    />
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  {t(action.titleKey)}
                </h3>
                <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
                  {t(action.descriptionKey)}
                </p>

                <Link
                  to={action.path}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-all duration-200 group-hover:gap-3 dark:text-primary-400"
                >
                  {t(action.buttonKey)}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-gradient-to-br from-primary-500/10 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}
