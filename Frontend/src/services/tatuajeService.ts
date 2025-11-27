import axiosInstance from "@/utils/axios";
import type { Tatuaje } from "@/types/tatuaje";
import type { Pago } from "@/types/pago";
import type { Cita } from "@/types/cita";
import type { RegistroTatuajeDto, RegistroTatuajeResponse } from "@/types/registroTatuaje";

const ENDPOINT = "/api/Tatuaje";

export const tatuajeService = {
  async getAll(): Promise<Tatuaje[]> {
    const response = await axiosInstance.get<Tatuaje[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Tatuaje> {
    const response = await axiosInstance.get<Tatuaje>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getByClienteId(idCliente: number): Promise<Tatuaje[]> {
    const response = await axiosInstance.get<Tatuaje[]>(`${ENDPOINT}/cliente/${idCliente}`);
    return response.data;
  },

  async getPagosByTatuajeId(idTatuaje: number): Promise<Pago[]> {
    const response = await axiosInstance.get<Pago[]>(`${ENDPOINT}/${idTatuaje}/pagos`);
    return response.data;
  },

  async getCitasByTatuajeId(idTatuaje: number): Promise<Cita[]> {
    const response = await axiosInstance.get<Cita[]>(`${ENDPOINT}/${idTatuaje}/citas`);
    return response.data;
  },

  async create(tatuaje: Partial<Tatuaje>): Promise<Tatuaje> {
    const response = await axiosInstance.post<Tatuaje>(ENDPOINT, tatuaje);
    return response.data;
  },

  async update(id: number, tatuaje: Partial<Tatuaje>): Promise<Tatuaje> {
    const response = await axiosInstance.put<Tatuaje>(`${ENDPOINT}/${id}`, tatuaje);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
  },

  // Nuevo endpoint para registro completo de tatuaje
  async registrarCompleto(data: RegistroTatuajeDto): Promise<RegistroTatuajeResponse> {
    const response = await axiosInstance.post<RegistroTatuajeResponse>(`${ENDPOINT}/registrar-completo`, data);
    return response.data;
  },
};
