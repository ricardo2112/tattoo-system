export interface Cita {
  idCita: number;
  titulo?: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos?: number;
  zona?: string;
  googleEventId?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: string;
}
