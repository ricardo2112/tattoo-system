import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Input, Radio } from "@/components/ui";

interface TatuajeData {
  artista: string;
  detalle: string;
  precio: string;
  zonaTatuaje: string;
  imagen: string;
  estadoPago: string;
}

interface TatuajeStepProps {
  tatuajeData: TatuajeData;
  setTatuajeData: (data: TatuajeData) => void;
}

export function TatuajeStep({ tatuajeData, setTatuajeData }: TatuajeStepProps) {
  const handleChange = (field: keyof TatuajeData, value: string) => {
    setTatuajeData({ ...tatuajeData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <DocumentTextIcon className="size-7 text-primary-500" />
          Información del Tatuaje
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete los detalles del servicio de tatuaje
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Artista</label>
          <Input
            value={tatuajeData.artista}
            onChange={(e) => handleChange("artista", e.target.value)}
            placeholder="Nombre del tatuador"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Zona del Tatuaje <span className="text-red-500">*</span>
          </label>
          <Input
            value={tatuajeData.zonaTatuaje}
            onChange={(e) => handleChange("zonaTatuaje", e.target.value)}
            placeholder="Ej: Brazo, Espalda, Pierna"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Detalle del Tatuaje <span className="text-red-500">*</span>
          </label>
          <textarea
            value={tatuajeData.detalle}
            onChange={(e) => handleChange("detalle", e.target.value)}
            placeholder="Descripción del diseño, estilo, tamaño, etc..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Precio (USD)</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
              $
            </span>
            <Input
              type="number"
              value={tatuajeData.precio}
              onChange={(e) => handleChange("precio", e.target.value)}
              placeholder="0.00"
              className="pl-8"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">URL de Imagen (opcional)</label>
          <Input
            type="url"
            value={tatuajeData.imagen}
            onChange={(e) => handleChange("imagen", e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-3 block text-sm font-medium">Estado de Pago</label>
          <div className="flex flex-wrap gap-4">
            <Radio
              name="estadoPago"
              checked={tatuajeData.estadoPago === "pendiente"}
              onChange={() => handleChange("estadoPago", "pendiente")}
              label="Pendiente"
            />
            <Radio
              name="estadoPago"
              checked={tatuajeData.estadoPago === "parcial"}
              onChange={() => handleChange("estadoPago", "parcial")}
              label="Pago Parcial"
            />
            <Radio
              name="estadoPago"
              checked={tatuajeData.estadoPago === "pagado"}
              onChange={() => handleChange("estadoPago", "pagado")}
              label="Pagado Completo"
            />
          </div>
        </div>
      </div>

      {/* Preview de la imagen si existe */}
      {tatuajeData.imagen && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-600">
          <h3 className="mb-2 text-sm font-medium">Vista Previa</h3>
          <div className="overflow-hidden rounded-lg">
            <img
              src={tatuajeData.imagen}
              alt="Vista previa del tatuaje"
              className="h-48 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/400x300?text=Imagen+no+disponible";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
