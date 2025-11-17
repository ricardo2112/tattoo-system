/**
 * Cliente Service
 * API service for managing clients
 */

import { apiClient } from './api';

export interface Cliente {
  idCliente?: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: Date | string;
  telefono?: string;
  email?: string;
  redes?: string;
  condicionMedica?: string;
  enfermedadPiel?: string;
  deporte?: string;
  referencia?: string;
  observaciones?: string;
  fechaCreacion?: Date | string;
}

export const clienteService = {
  /**
   * Get all clients
   */
  async getAllClientes(): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>('/api/Cliente');
    return response.data;
  },

  /**
   * Get client by ID
   */
  async getClienteById(id: number): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(`/api/Cliente/${id}`);
    return response.data;
  },

  /**
   * Create new client
   */
  async crearCliente(cliente: Cliente): Promise<Cliente> {
    const response = await apiClient.post<Cliente>('/api/Cliente', cliente);
    return response.data;
  },

  /**
   * Update existing client
   */
  async actualizarCliente(id: number, cliente: Cliente): Promise<Cliente> {
    const response = await apiClient.put<Cliente>(`/api/Cliente/${id}`, cliente);
    return response.data;
  },

  /**
   * Delete client
   */
  async eliminarCliente(id: number): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.delete<{ message: string; success: boolean }>(
      `/api/Cliente/${id}`
    );
    return response.data;
  },
};

export default clienteService;
