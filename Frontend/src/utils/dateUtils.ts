/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha en formato ISO local (sin conversión a UTC)
 * Formato: YYYY-MM-DDTHH:mm:ss
 *
 * Esta función es útil cuando necesitas enviar fechas al backend
 * sin que JavaScript las convierta automáticamente a UTC.
 *
 * @param date - Fecha a formatear
 * @returns String en formato ISO local (sin sufijo Z)
 *
 * @example
 * const fecha = new Date('2025-12-04T15:30:00');
 * formatLocalISO(fecha); // '2025-12-04T15:30:00'
 */
export const formatLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Construye una fecha local a partir de una fecha y hora separadas
 *
 * @param dateStr - Fecha en formato YYYY-MM-DD
 * @param timeStr - Hora en formato HH:mm
 * @returns Date object
 *
 * @example
 * buildLocalDateTime('2025-12-04', '15:30'); // Date object
 */
export const buildLocalDateTime = (dateStr: string, timeStr: string): Date => {
  return new Date(`${dateStr}T${timeStr}`);
};

/**
 * Calcula la diferencia en minutos entre dos fechas
 *
 * @param start - Fecha de inicio
 * @param end - Fecha de fin
 * @returns Diferencia en minutos
 *
 * @example
 * const inicio = new Date('2025-12-04T15:00:00');
 * const fin = new Date('2025-12-04T17:30:00');
 * getDurationInMinutes(inicio, fin); // 150
 */
export const getDurationInMinutes = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 60000);
};
