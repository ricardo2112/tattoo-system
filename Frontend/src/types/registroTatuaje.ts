import type { Cliente } from './cliente';
import type { Tutor } from './tutor';
import type { Tatuaje } from './tatuaje';
import type { Cita } from './cita';
import type { Formulario } from './formulario';
import type { Pago } from './pago';

export interface ClienteDto {
  idCliente?: number;
  identificacion?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  nacionalidad?: string;
  telefono?: string;
  email?: string;
  redes?: string;
  condicionMedica?: string;
  enfermedadPiel?: string;
  deporte?: string;
  referencia?: string;
  observaciones?: string;
}

export interface TutorDto {
  idTutor?: number;
  identificacion?: string;
  nombre: string;
  apellido: string;
  parentezco?: string;
}

export interface TatuajeDto {
  artista?: string;
  detalle?: string;
  precio?: number;
  zonaTatuaje?: string;
  imagen?: string;
  estadoPago: string;
}

export interface PagoDto {
  monto: number;
  formaPago?: string;
  fechaPago?: string;
}

export interface CitaDto {
  titulo?: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos?: number;
  zona?: string;
}

export interface RegistroTatuajeDto {
  cliente: ClienteDto;
  tutor?: TutorDto | null;
  tatuaje: TatuajeDto;
  pago?: PagoDto | null;
  cita: CitaDto;
  registradoPor: number;
}

export interface RegistroTatuajeResponse {
  cliente: Cliente;
  tutor?: Tutor | null;
  tatuaje: Tatuaje;
  pago?: Pago | null;
  cita: Cita;
  esMenorDeEdad: boolean;
  formulario?: Formulario | null;
  formularioHtml?: string | null;
  mensaje: string;
}
