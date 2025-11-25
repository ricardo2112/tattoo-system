import axiosInstance from "@/utils/axios";
import type { Pago } from "@/types/pago";

const ENDPOINT = "/api/Pago";

export const pagoService = {
  async getAll(): Promise<Pago[]> {
    const response = await axiosInstance.get<Pago[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Pago> {
    const response = await axiosInstance.get<Pago>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(pago: Partial<Pago>): Promise<Pago> {
    const response = await axiosInstance.post<Pago>(ENDPOINT, pago);
    return response.data;
  },

  async update(id: number, pago: Partial<Pago>): Promise<Pago> {
    const response = await axiosInstance.put<Pago>(`${ENDPOINT}/${id}`, pago);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
  },
};
