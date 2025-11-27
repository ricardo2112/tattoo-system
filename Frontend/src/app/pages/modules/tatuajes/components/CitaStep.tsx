import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";

interface CitaData {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos: string;
  zona: string;
}

interface CitaStepProps {
  citaData: CitaData;
  setCitaData: (data: CitaData) => void;
  tatuajeZona: string;
  clienteNombre: string;
}

export function CitaStep({ citaData, setCitaData, tatuajeZona, clienteNombre }: CitaStepProps) {
  const handleChange = (field: keyof CitaData, value: string) => {
    setCitaData({ ...citaData, [field]: value });

    // Auto-calcular duración cuando cambian las fechas
    if (field === "fechaInicio" || field === "fechaFin") {
      const inicio = field === "fechaInicio" ? value : citaData.fechaInicio;
      const fin = field === "fechaFin" ? value : citaData.fechaFin;

      if (inicio && fin) {
        const inicioDate = new Date(inicio);
        const finDate = new Date(fin);
        const diffMs = finDate.getTime() - inicioDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins > 0) {
          setCitaData({ ...citaData, [field]: value, duracionMinutos: diffMins.toString() });
        }
      }
    }
  };

  // Auto-completar título si está vacío
  const autoTitle = citaData.titulo || `Tatuaje - ${clienteNombre}`;
  const autoZona = citaData.zona || tatuajeZona;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <CalendarDaysIcon className="size-7 text-primary-500" />
          Agendar Cita
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Programe la fecha y hora para el servicio de tatuaje
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Título de la Cita</label>
          <Input
            value={citaData.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder={autoTitle}
          />
          {!citaData.titulo && (
            <p className="mt-1 text-xs text-gray-500">Se usará: "{autoTitle}"</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fecha y Hora de Inicio <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={citaData.fechaInicio}
            onChange={(date) => handleChange("fechaInicio", date)}
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              time_24hr: true,
              minDate: "today",
            }}
            placeholder="Seleccione fecha y hora de inicio"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fecha y Hora de Fin <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={citaData.fechaFin}
            onChange={(date) => handleChange("fechaFin", date)}
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              time_24hr: true,
              minDate: citaData.fechaInicio || "today",
            }}
            placeholder="Seleccione fecha y hora de fin"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Duración Estimada (minutos)</label>
          <Input
            type="number"
            value={citaData.duracionMinutos}
            onChange={(e) => handleChange("duracionMinutos", e.target.value)}
            placeholder="180"
            min="0"
          />
          {citaData.duracionMinutos && (
            <p className="mt-1 text-xs text-gray-500">
              Aproximadamente {Math.floor(Number(citaData.duracionMinutos) / 60)} horas{" "}
              {Number(citaData.duracionMinutos) % 60} minutos
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Zona/Sala</label>
          <Input
            value={citaData.zona}
            onChange={(e) => handleChange("zona", e.target.value)}
            placeholder={autoZona || "Sala principal"}
          />
          {!citaData.zona && tatuajeZona && (
            <p className="mt-1 text-xs text-gray-500">Se usará: "{autoZona}"</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Descripción</label>
          <textarea
            value={citaData.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            placeholder="Notas adicionales para la cita..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
          />
        </div>
      </div>

      {/* Resumen visual de la cita */}
      {citaData.fechaInicio && citaData.fechaFin && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <h3 className="mb-2 font-semibold text-primary-900 dark:text-primary-100">
            Resumen de la Cita
          </h3>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Inicio:</span>{" "}
              {new Date(citaData.fechaInicio).toLocaleString("es-ES", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
            <div>
              <span className="font-medium">Fin:</span>{" "}
              {new Date(citaData.fechaFin).toLocaleString("es-ES", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
            {citaData.duracionMinutos && (
              <div>
                <span className="font-medium">Duración:</span> {citaData.duracionMinutos} minutos (
                {Math.floor(Number(citaData.duracionMinutos) / 60)}h{" "}
                {Number(citaData.duracionMinutos) % 60}min)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
