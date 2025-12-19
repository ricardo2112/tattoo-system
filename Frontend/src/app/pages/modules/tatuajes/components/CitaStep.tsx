import { useState, useEffect } from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { formatLocalISO, buildLocalDateTime, getDurationInMinutes } from "@/utils/dateUtils";

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
  tatuajeDetalle: string;
  tatuajeArtista: string;
  clienteNombre: string;
}

export function CitaStep({
  citaData,
  setCitaData,
  tatuajeZona,
  tatuajeDetalle,
  tatuajeArtista,
  clienteNombre
}: CitaStepProps) {
  // Estados locales para fecha y horas
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");

  // Calcular duración automáticamente
  useEffect(() => {
    if (fechaSeleccionada && horaInicio && horaFin) {
      // Construir fechas completas usando función utilitaria
      const inicio = buildLocalDateTime(fechaSeleccionada, horaInicio);
      const fin = buildLocalDateTime(fechaSeleccionada, horaFin);

      // Calcular duración en minutos usando función utilitaria
      const diffMins = getDurationInMinutes(inicio, fin);

      if (diffMins > 0) {
        // Actualizar citaData con fechas en formato ISO LOCAL (sin conversión UTC)
        setCitaData({
          ...citaData,
          fechaInicio: formatLocalISO(inicio),
          fechaFin: formatLocalISO(fin),
          duracionMinutos: diffMins.toString(),
        });
      }
    }
  }, [fechaSeleccionada, horaInicio, horaFin]);

  // Cuando cambia la hora de inicio, actualizar hora de fin automáticamente (1 hora después)
  useEffect(() => {
    if (horaInicio && !horaFin) {
      const [hours, minutes] = horaInicio.split(':').map(Number);
      const newHour = (hours + 1) % 24;
      const newTime = `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      setHoraFin(newTime);
    }
  }, [horaInicio]);

  const handleChange = (field: keyof CitaData, value: string) => {
    setCitaData({ ...citaData, [field]: value });
  };

  // Auto-generar título con información del tatuaje
  const generarTitulo = (): string => {
    if (clienteNombre && tatuajeZona) {
      return `Tatuaje ${tatuajeZona} - ${clienteNombre}`;
    } else if (clienteNombre) {
      return `Tatuaje - ${clienteNombre}`;
    }
    return "Sesión de Tatuaje";
  };

  // Auto-generar descripción con información del tatuaje
  const generarDescripcion = (): string => {
    const partes: string[] = [];

    if (clienteNombre) partes.push(`Cliente: ${clienteNombre}`);
    if (tatuajeArtista) partes.push(`Artista: ${tatuajeArtista}`);
    if (tatuajeZona) partes.push(`Zona: ${tatuajeZona}`);
    if (tatuajeDetalle) partes.push(`Detalle: ${tatuajeDetalle}`);

    return partes.join(" | ");
  };

  const tituloSugerido = citaData.titulo || generarTitulo();
  const descripcionSugerida = citaData.descripcion || generarDescripcion();

  // Calcular duración en formato legible
  const duracionFormateada = citaData.duracionMinutos
    ? `${Math.floor(Number(citaData.duracionMinutos) / 60)}h ${Number(citaData.duracionMinutos) % 60}min`
    : "";

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <CalendarDaysIcon className="size-7 text-primary-500" />
          Agendar Cita
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Programe la sesión de tatuaje con el cliente
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Título de la Cita */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Título de la Cita</label>
          <Input
            value={citaData.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder={tituloSugerido}
          />
          {!citaData.titulo && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Se usará: <span className="font-medium">"{tituloSugerido}"</span>
            </p>
          )}
        </div>

        {/* Fecha de la Cita */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Fecha de la Cita <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={fechaSeleccionada}
            onChange={(date) => {
              // Convertir a formato YYYY-MM-DD
              if (Array.isArray(date) && date.length > 0) {
                const selectedDate = new Date(date[0]);
                const formatted = selectedDate.toISOString().split('T')[0];
                setFechaSeleccionada(formatted);
              } else if (typeof date === 'string') {
                const selectedDate = new Date(date);
                const formatted = selectedDate.toISOString().split('T')[0];
                setFechaSeleccionada(formatted);
              }
            }}
            options={{
              minDate: "today",
              dateFormat: "Y-m-d",
              locale: {
                firstDayOfWeek: 1,
              },
            }}
            placeholder="Seleccione la fecha de la cita..."
          />
        </div>

        {/* Hora de Inicio */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Hora de Inicio <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={horaInicio}
            onChange={(time) => {
              if (Array.isArray(time) && time.length > 0) {
                const selectedTime = new Date(time[0]);
                const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                setHoraInicio(formatted);
              } else if (typeof time === 'string') {
                // Extraer hora y minutos del string
                const selectedTime = new Date(time);
                const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                setHoraInicio(formatted);
              }
            }}
            options={{
              enableTime: true,
              noCalendar: true,
              dateFormat: "H:i",
              time_24hr: true,
            }}
            placeholder="Seleccione hora de inicio..."
          />
        </div>

        {/* Hora de Fin */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Hora de Fin <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={horaFin}
            onChange={(time) => {
              if (Array.isArray(time) && time.length > 0) {
                const selectedTime = new Date(time[0]);
                const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                setHoraFin(formatted);
              } else if (typeof time === 'string') {
                const selectedTime = new Date(time);
                const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                setHoraFin(formatted);
              }
            }}
            options={{
              enableTime: true,
              noCalendar: true,
              dateFormat: "H:i",
              time_24hr: true,
            }}
            placeholder="Seleccione hora de fin..."
          />
          {horaInicio && horaFin && (
            horaFin <= horaInicio ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                La hora de fin debe ser posterior a la hora de inicio
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <ClockIcon className="size-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  Duración: {duracionFormateada} ({citaData.duracionMinutos} min)
                </span>
              </div>
            )
          )}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Descripción para Google Calendar</label>
          <textarea
            value={citaData.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            placeholder={descripcionSugerida}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
          />
          {!citaData.descripcion && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Se generará automáticamente con: Cliente, Artista, Zona y Detalle del tatuaje
            </p>
          )}
        </div>
      </div>

      {/* Resumen visual de la cita */}
      {fechaSeleccionada && horaInicio && horaFin && horaFin > horaInicio && (
        <div className="rounded-xl border-2 border-success-200 bg-gradient-to-br from-success-50 to-success-100/50 p-5 dark:border-success-800 dark:from-success-900/20 dark:to-success-800/10">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-success-900 dark:text-success-100">
            <CalendarDaysIcon className="size-5" />
            Resumen de la Cita
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-success-700 dark:text-success-300">Fecha:</span>
              <span className="font-semibold text-success-900 dark:text-success-100">
                {new Date(fechaSeleccionada).toLocaleDateString("es-ES", {
                  dateStyle: "full",
                })}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-success-700 dark:text-success-300">Horario:</span>
              <span className="font-semibold text-success-900 dark:text-success-100">
                {horaInicio} - {horaFin}
              </span>
            </div>
            {citaData.duracionMinutos && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-success-700 dark:text-success-300">Duración:</span>
                <span className="font-semibold text-success-900 dark:text-success-100">
                  {duracionFormateada} ({citaData.duracionMinutos} minutos)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
