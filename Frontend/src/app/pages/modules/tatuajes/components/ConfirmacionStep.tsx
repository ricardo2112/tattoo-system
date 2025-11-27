import { CheckCircleIcon, UserIcon, ShieldCheckIcon, DocumentTextIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { Cliente } from "@/types/cliente";
import type { Tutor } from "@/types/tutor";

interface ConfirmacionStepProps {
  modoCliente: "seleccionar" | "crear";
  clienteSeleccionado: Cliente | null;
  nuevoCliente: any;
  modoTutor: "seleccionar" | "crear";
  tutorSeleccionado: Tutor | null;
  nuevoTutor: any;
  tatuajeData: any;
  citaData: any;
  esMenorDeEdad: boolean;
  calculateAge: (date: string) => number;
}

export function ConfirmacionStep({
  modoCliente,
  clienteSeleccionado,
  nuevoCliente,
  modoTutor,
  tutorSeleccionado,
  nuevoTutor,
  tatuajeData,
  citaData,
  esMenorDeEdad,
  calculateAge,
}: ConfirmacionStepProps) {
  const cliente = modoCliente === "seleccionar" ? clienteSeleccionado : nuevoCliente;
  const tutor = modoTutor === "seleccionar" ? tutorSeleccionado : nuevoTutor;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <CheckCircleIcon className="size-7 text-primary-500" />
          Confirmar Registro
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Revise toda la información antes de confirmar el registro
        </p>
      </div>

      <div className="space-y-4">
        {/* Cliente */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <UserIcon className="size-5 text-primary-500" />
            Cliente {modoCliente === "crear" && <span className="text-xs font-normal text-success">(Nuevo)</span>}
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
              <span className="font-medium">{cliente?.nombre} {cliente?.apellido}</span>
            </div>
            {cliente?.identificacion && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Identificación:</span>
                <span className="font-medium">{cliente.identificacion}</span>
              </div>
            )}
            {cliente?.fechaNacimiento && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Edad:</span>
                <span className="font-medium">{calculateAge(cliente.fechaNacimiento)} años</span>
              </div>
            )}
            {cliente?.telefono && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                <span className="font-medium">{cliente.telefono}</span>
              </div>
            )}
            {cliente?.email && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium">{cliente.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tutor (solo si es menor) */}
        {esMenorDeEdad && tutor && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-warning-900 dark:text-warning-100">
              <ShieldCheckIcon className="size-5 text-warning-600" />
              Tutor Responsable {modoTutor === "crear" && <span className="text-xs font-normal">(Nuevo)</span>}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-warning-800 dark:text-warning-200">Nombre:</span>
                <span className="font-medium text-warning-900 dark:text-warning-100">{tutor.nombre} {tutor.apellido}</span>
              </div>
              {tutor.parentezco && (
                <div className="flex justify-between">
                  <span className="text-warning-800 dark:text-warning-200">Parentezco:</span>
                  <span className="font-medium text-warning-900 dark:text-warning-100">{tutor.parentezco}</span>
                </div>
              )}
              {tutor.identificacion && (
                <div className="flex justify-between">
                  <span className="text-warning-800 dark:text-warning-200">Identificación:</span>
                  <span className="font-medium text-warning-900 dark:text-warning-100">{tutor.identificacion}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tatuaje */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <DocumentTextIcon className="size-5 text-primary-500" />
            Tatuaje
          </h3>
          <div className="grid gap-2 text-sm">
            {tatuajeData.zonaTatuaje && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zona:</span>
                <span className="font-medium">{tatuajeData.zonaTatuaje}</span>
              </div>
            )}
            {tatuajeData.detalle && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 mb-1">Detalle:</span>
                <span className="font-medium text-sm">{tatuajeData.detalle}</span>
              </div>
            )}
            {tatuajeData.artista && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Artista:</span>
                <span className="font-medium">{tatuajeData.artista}</span>
              </div>
            )}
            {tatuajeData.precio && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                <span className="font-medium">${tatuajeData.precio} USD</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estado de Pago:</span>
              <span className={`font-medium ${
                tatuajeData.estadoPago === "pagado" ? "text-success" :
                tatuajeData.estadoPago === "parcial" ? "text-warning" :
                "text-error"
              }`}>
                {tatuajeData.estadoPago === "pagado" ? "Pagado Completo" :
                 tatuajeData.estadoPago === "parcial" ? "Pago Parcial" :
                 "Pendiente"}
              </span>
            </div>
          </div>
        </div>

        {/* Cita */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <CalendarDaysIcon className="size-5 text-primary-500" />
            Cita
          </h3>
          <div className="grid gap-2 text-sm">
            {citaData.fechaInicio && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 mb-1">Fecha y Hora:</span>
                <span className="font-medium">
                  {new Date(citaData.fechaInicio).toLocaleString("es-ES", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
            {citaData.duracionMinutos && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                <span className="font-medium">
                  {Math.floor(Number(citaData.duracionMinutos) / 60)}h {Number(citaData.duracionMinutos) % 60}min
                </span>
              </div>
            )}
            {citaData.zona && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zona/Sala:</span>
                <span className="font-medium">{citaData.zona}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advertencia importante */}
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <p className="text-sm text-primary-900 dark:text-primary-100">
          <span className="font-semibold">Importante:</span> Al confirmar se creará el registro completo del tatuaje,
          se agendará la cita{esMenorDeEdad && " y se generará el formulario de consentimiento para menores de edad"}.
          {" "}Los datos se sincronizarán con Google Calendar automáticamente.
        </p>
      </div>
    </div>
  );
}
