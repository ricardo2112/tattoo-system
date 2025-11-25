export interface Catalogo {
  idCatalogo: number;
  idTipoCatalogo: number;
  nombreCatalogo: string;
}

export interface TipoCatalogo {
  idTipoCatalogo: number;
  nombreTipo: string;
  catalogos: Catalogo[];
}
