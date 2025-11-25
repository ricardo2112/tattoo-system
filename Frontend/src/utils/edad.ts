export function calcularEdad(fechaNacimiento?: string): number {
  if (!fechaNacimiento) return 0;

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffMs = hoy.getTime() - nacimiento.getTime();
  const edad = new Date(diffMs).getUTCFullYear() - 1970;

  return edad;
}
