export interface Cliente {
  idCliente: number;
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
  fechaCreacion: string;
}

export interface ClienteFormData extends Omit<Cliente, 'idCliente' | 'fechaCreacion'> {
  idCliente?: number;
}
