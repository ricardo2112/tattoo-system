import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";

/**
 * Settings Appearance page
 * Appearance and theme settings
 */
export default function SettingsAppearance() {
  return (
    <Page title="Apariencia">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Apariencia
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Personaliza el aspecto de la aplicación
          </p>
        </div>

        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Opciones de apariencia próximamente...
          </p>
        </Card>
      </div>
    </Page>
  );
}
