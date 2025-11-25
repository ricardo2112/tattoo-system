import axiosInstance from "@/utils/axios";
import type { Cita } from "@/types/cita";

const ENDPOINT = "/api/Cita";

export const citaService = {
  async getAll(): Promise<Cita[]> {
    const response = await axiosInstance.get<Cita[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Cita> {
    const response = await axiosInstance.get<Cita>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getByEstado(estado: string): Promise<Cita[]> {
    const response = await axiosInstance.get<Cita[]>(`${ENDPOINT}/estado/${estado}`);
    return response.data;
  },

  async getByFecha(fecha: string): Promise<Cita[]> {
    const response = await axiosInstance.get<Cita[]>(`${ENDPOINT}/fecha/${fecha}`);
    return response.data;
  },

  async create(cita: Partial<Cita>): Promise<Cita> {
    const response = await axiosInstance.post<Cita>(ENDPOINT, cita);
    return response.data;
  },

  async update(id: number, cita: Partial<Cita>): Promise<Cita> {
    const response = await axiosInstance.put<Cita>(`${ENDPOINT}/${id}`, cita);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
  },
};
