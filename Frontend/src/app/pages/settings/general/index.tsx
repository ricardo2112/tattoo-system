import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";

/**
 * Settings General page
 * General application settings and preferences
 */
export default function SettingsGeneral() {
  return (
    <Page title="Configuración General">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración General
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestiona las configuraciones generales de la aplicación
          </p>
        </div>

        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Contenido de configuración próximamente...
          </p>
        </Card>
      </div>
    </Page>
  );
}
