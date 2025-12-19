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

  async registrarCompleto(data: RegistroTatuajeDto): Promise<RegistroTatuajeResponse> {
    console.log("--- Enviando al backend ---");
    console.log("Data a enviar:", data);
    console.log("Cliente ID enviado:", data.cliente.idCliente);
    const response = await axiosInstance.post<RegistroTatuajeResponse>(ENDPOINT, data);
    return response.data;
  },

  async update(id: number, tatuaje: Partial<Tatuaje>): Promise<Tatuaje> {
    const response = await axiosInstance.put<Tatuaje>(`${ENDPOINT}/${id}`, tatuaje);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
  },

  async registrarPago(idTatuaje: number, idPago: number): Promise<void> {
    const response = await axiosInstance.post(`${ENDPOINT}/${idTatuaje}/pagos/${idPago}`);
    return response.data;
  },
};
