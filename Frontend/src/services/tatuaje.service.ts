/**
 * Tatuaje Service
 * API service for managing tattoos
 */

import { apiClient } from './api';

export interface Tatuaje {
  idTatuaje?: number;
  idCliente: number;
  artista?: string;
  detalle?: string;
  precio?: number;
  zonaTatuaje?: string;
  imagen?: string;
  estadoPago?: string;
  registradoPor?: number;
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
}

export const tatuajeService = {
  /**
   * Get all tattoos
   */
  async getAllTatuajes(): Promise<Tatuaje[]> {
    const response = await apiClient.get<Tatuaje[]>('/api/Tatuaje');
    return response.data;
  },

  /**
   * Get tattoo by ID
   */
  async getTatuajeById(id: number): Promise<Tatuaje> {
    const response = await apiClient.get<Tatuaje>(`/api/Tatuaje/${id}`);
    return response.data;
  },

  /**
   * Get tattoos by client ID
   */
  async getTatuajesByClienteId(idCliente: number): Promise<Tatuaje[]> {
    const response = await apiClient.get<Tatuaje[]>(`/api/Tatuaje/cliente/${idCliente}`);
    return response.data;
  },

  /**
   * Create new tattoo
   */
  async crearTatuaje(tatuaje: Tatuaje): Promise<Tatuaje> {
    const response = await apiClient.post<Tatuaje>('/api/Tatuaje', tatuaje);
    return response.data;
  },

  /**
   * Update existing tattoo
   */
  async actualizarTatuaje(id: number, tatuaje: Tatuaje): Promise<Tatuaje> {
    const response = await apiClient.put<Tatuaje>(`/api/Tatuaje/${id}`, tatuaje);
    return response.data;
  },

  /**
   * Delete tattoo
   */
  async eliminarTatuaje(id: number): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.delete<{ message: string; success: boolean }>(
      `/api/Tatuaje/${id}`
    );
    return response.data;
  },
};

export default tatuajeService;
