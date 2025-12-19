import {
  CheckCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { ClienteFormData } from "@/types/cliente";
import type { Tutor } from "@/types/tutor";

interface ConfirmacionStepProps {
  modoCliente: "seleccionar" | "crear";
  clienteSeleccionado: any | null;
  nuevoCliente: ClienteFormData;
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

  // Calcular saldo si hay precio y abono
  const precio = parseFloat(tatuajeData.precio) || 0;
  const abono = parseFloat(tatuajeData.abono) || 0;
  const saldo = precio - abono;

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50/30 p-6 dark:border-primary-800 dark:from-primary-900/20 dark:via-dark-700 dark:to-primary-900/10">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-600 shadow-lg dark:bg-primary-500">
            <CheckCircleIcon className="size-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirmar Registro
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Revise toda la información antes de confirmar
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Cliente */}
        <div className="group overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-dark-600 dark:bg-dark-750">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 dark:border-dark-600 dark:from-dark-700 dark:to-dark-750">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <UserIcon className="size-5 text-primary-600 dark:text-primary-400" />
              </div>
              Cliente
              {modoCliente === "crear" && (
                <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-800 dark:bg-success-900/30 dark:text-success-200">
                  Nuevo
                </span>
              )}
            </h3>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Nombre Completo
              </p>
              <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                {cliente?.nombre} {cliente?.apellido}
              </p>
            </div>
            {cliente?.identificacion && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Identificación
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {cliente.identificacion}
                </p>
              </div>
            )}
            {cliente?.fechaNacimiento && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Edad
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {calculateAge(cliente.fechaNacimiento)} años
                  {esMenorDeEdad && (
                    <span className="ml-2 rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-semibold text-warning-800 dark:bg-warning-900/30 dark:text-warning-200">
                      Menor de edad
                    </span>
                  )}
                </p>
              </div>
            )}
            {cliente?.telefono && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Teléfono
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {cliente.telefono}
                </p>
              </div>
            )}
            {cliente?.email && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {cliente.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tutor (solo si es menor) */}
        {esMenorDeEdad && tutor && (
          <div className="group overflow-hidden rounded-xl border-2 border-warning-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-warning-800 dark:bg-dark-750">
            <div className="border-b border-warning-100 bg-gradient-to-r from-warning-50 to-white px-5 py-4 dark:border-warning-900 dark:from-warning-900/20 dark:to-dark-750">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-warning-900 dark:text-warning-100">
                <div className="flex size-9 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-900/30">
                  <ShieldCheckIcon className="size-5 text-warning-600 dark:text-warning-400" />
                </div>
                Tutor Responsable
                {modoTutor === "crear" && (
                  <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-800 dark:bg-success-900/30 dark:text-success-200">
                    Nuevo
                  </span>
                )}
              </h3>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-warning-700 dark:text-warning-300">
                  Nombre Completo
                </p>
                <p className="mt-1 text-base font-semibold text-warning-900 dark:text-warning-100">
                  {tutor.nombre} {tutor.apellido}
                </p>
              </div>
              {tutor.parentezco && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-warning-700 dark:text-warning-300">
                    Parentezco
                  </p>
                  <p className="mt-1 text-base font-semibold text-warning-900 dark:text-warning-100">
                    {tutor.parentezco}
                  </p>
                </div>
              )}
              {tutor.identificacion && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-warning-700 dark:text-warning-300">
                    Identificación
                  </p>
                  <p className="mt-1 text-base font-semibold text-warning-900 dark:text-warning-100">
                    {tutor.identificacion}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tatuaje */}
        <div className="group overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-dark-600 dark:bg-dark-750">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 dark:border-dark-600 dark:from-dark-700 dark:to-dark-750">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <DocumentTextIcon className="size-5 text-primary-600 dark:text-primary-400" />
              </div>
              Información del Tatuaje
            </h3>
          </div>
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {tatuajeData.artista && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Artista
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <SparklesIcon className="size-4 text-primary-500" />
                    {tatuajeData.artista}
                  </p>
                </div>
              )}
              {tatuajeData.zonaTatuaje && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Zona del Cuerpo
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {tatuajeData.zonaTatuaje}
                  </p>
                </div>
              )}
            </div>

            {tatuajeData.detalle && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Descripción del Diseño
                </p>
                <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-900 dark:bg-dark-700 dark:text-white">
                  {tatuajeData.detalle}
                </p>
              </div>
            )}

            {/* Información de Pago */}
            {tatuajeData.precio && (
              <div className="rounded-xl border-2 border-primary-100 bg-gradient-to-br from-primary-50/50 to-white p-4 dark:border-primary-900 dark:from-primary-900/10 dark:to-dark-700">
                <div className="mb-3 flex items-center gap-2">
                  <CurrencyDollarIcon className="size-5 text-primary-600 dark:text-primary-400" />
                  <p className="text-sm font-bold uppercase tracking-wide text-primary-900 dark:text-primary-100">
                    Detalles del Pago
                  </p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Precio total:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${tatuajeData.precio} USD
                    </span>
                  </div>
                  {abono > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Abono inicial:
                        </span>
                        <span className="text-base font-bold text-success-600 dark:text-success-400">
                          ${tatuajeData.abono} USD
                        </span>
                      </div>
                      {tatuajeData.formaPago && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Forma de pago:
                          </span>
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {tatuajeData.formaPago}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-primary-200 pt-2.5 dark:border-primary-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Saldo pendiente:
                          </span>
                          <span className="text-lg font-bold text-error-600 dark:text-error-400">
                            ${saldo.toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 dark:bg-dark-750/60">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado:
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold capitalize ${
                        tatuajeData.estadoPago === "pagado"
                          ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200"
                          : tatuajeData.estadoPago === "parcial"
                          ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
                          : "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200"
                      }`}
                    >
                      {tatuajeData.estadoPago === "parcial" ? "Pago Parcial" : tatuajeData.estadoPago}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cita */}
        <div className="group overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-dark-600 dark:bg-dark-750">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 dark:border-dark-600 dark:from-dark-700 dark:to-dark-750">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <CalendarDaysIcon className="size-5 text-primary-600 dark:text-primary-400" />
              </div>
              Cita Agendada
            </h3>
          </div>
          <div className="grid gap-4 p-5">
            {citaData.fechaInicio && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Fecha y Hora de la Sesión
                </p>
                <p className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(citaData.fechaInicio).toLocaleString("es-ES", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}
            {citaData.duracionMinutos && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Duración Estimada
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {citaData.duracionMinutos} minutos (
                  {Math.floor(Number(citaData.duracionMinutos) / 60)}h{" "}
                  {Number(citaData.duracionMinutos) % 60}min)
                </p>
              </div>
            )}
            {citaData.zona && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Zona/Sala
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {citaData.zona}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advertencia importante con diseño premium */}
      <div className="overflow-hidden rounded-xl border-2 border-primary-300 bg-gradient-to-br from-primary-100 via-primary-50 to-white p-6 shadow-md dark:border-primary-700 dark:from-primary-900/30 dark:via-primary-900/20 dark:to-dark-700">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-600 shadow-lg dark:bg-primary-500">
            <CheckCircleIcon className="size-7 text-white" />
          </div>
          <div>
            <h4 className="mb-2 text-base font-bold text-primary-900 dark:text-primary-100">
              Antes de Confirmar
            </h4>
            <ul className="space-y-1.5 text-sm leading-relaxed text-primary-800 dark:text-primary-200">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary-600 dark:text-primary-400">✓</span>
                Se creará el registro completo del tatuaje en el sistema
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary-600 dark:text-primary-400">✓</span>
                La cita se agendará y sincronizará con Google Calendar
              </li>
              {abono > 0 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary-600 dark:text-primary-400">✓</span>
                  El abono de ${tatuajeData.abono} USD se registrará en el sistema de pagos
                </li>
              )}
              {esMenorDeEdad && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary-600 dark:text-primary-400">✓</span>
                  Se generará el formulario de consentimiento para menores de edad
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
