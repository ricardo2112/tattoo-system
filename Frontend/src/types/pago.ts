export interface Pago {
  idPago: number;
  monto: number;
  formaPago?: string;
  fechaPago?: string;
  fechaCreacion: string;
}
