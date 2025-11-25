export interface Tatuaje {
  idTatuaje: number;
  idCliente: number;
  artista?: string;
  detalle?: string;
  precio?: number;
  zonaTatuaje?: string;
  imagen?: string;
  estadoPago: string;
  registradoPor: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}
