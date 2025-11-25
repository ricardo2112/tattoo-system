import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { UsersIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

/**
 * Clientes page
 * Manage clients and their information
 */
export default function Clientes() {
  const { t } = useTranslation();

  return (
    <Page title={t("modules.clients.title")}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-xl bg-blue-500 bg-opacity-10 p-4">
            <UsersIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("modules.clients.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t("modules.clients.description")}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            {t("modules.clients.comingSoon")}
          </p>
        </Card>
      </div>
    </Page>
  );
}
