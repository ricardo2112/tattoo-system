import axiosInstance from "@/utils/axios";
import type { Catalogo, TipoCatalogo } from "@/types/catalogo";

const ENDPOINT = "/api/Catalogo";

export const catalogoService = {
  async getAll(): Promise<TipoCatalogo[]> {
    const response = await axiosInstance.get<TipoCatalogo[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Catalogo[]> {
    const response = await axiosInstance.get<Catalogo[]>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getByTipo(idTipo: number): Promise<Catalogo[]> {
    const response = await axiosInstance.get<Catalogo[]>(`${ENDPOINT}/tipoCatalogo/${idTipo}`);
    return response.data;
  },
};
