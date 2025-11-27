export interface Formulario {
  idFormulario: number;
  nombreFormulario: string;
  cuerpoHtml?: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface EventoFormulario {
  idEvento: number;
  idFormulario?: number;
  evento: string;
  formulario?: Formulario;
}
