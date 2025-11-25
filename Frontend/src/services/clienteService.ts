import axiosInstance from "@/utils/axios";
import type { Cliente, ClienteFormData } from "@/types/cliente";

const ENDPOINT = "/api/Cliente";

export const clienteService = {
  async getAll(): Promise<Cliente[]> {
    const response = await axiosInstance.get<Cliente[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Cliente> {
    const response = await axiosInstance.get<Cliente>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(cliente: ClienteFormData): Promise<Cliente> {
    const response = await axiosInstance.post<Cliente>(ENDPOINT, cliente);
    return response.data;
  },

  async update(id: number, cliente: ClienteFormData): Promise<Cliente> {
    const response = await axiosInstance.put<Cliente>(`${ENDPOINT}/${id}`, cliente);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string; success: boolean }> {
    const response = await axiosInstance.delete<{ message: string; success: boolean }>(`${ENDPOINT}/${id}`);
    return response.data;
  },
};
