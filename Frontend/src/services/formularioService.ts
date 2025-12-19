import axiosInstance from "@/utils/axios";
import type { Formulario, EventoFormulario } from "@/types/formulario";

const ENDPOINT = "/api/Formulario";

export const formularioService = {
  async getAll(): Promise<Formulario[]> {
    const response = await axiosInstance.get<Formulario[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Formulario> {
    const response = await axiosInstance.get<Formulario>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getByEvento(evento: string): Promise<Formulario> {
    const response = await axiosInstance.get<Formulario>(`${ENDPOINT}/evento/${evento}`);
    return response.data;
  },

  async create(formulario: Partial<Formulario>): Promise<Formulario> {
    const response = await axiosInstance.post<Formulario>(ENDPOINT, formulario);
    return response.data;
  },

  async update(id: number, formulario: Partial<Formulario>): Promise<Formulario> {
    const response = await axiosInstance.put<Formulario>(`${ENDPOINT}/${id}`, formulario);
    return response.data;
  },

  async delete(id: number): Promise<boolean> {
    const response = await axiosInstance.delete<{ success: boolean }>(`${ENDPOINT}/${id}`);
    return response.data.success;
  },

  async getAllEventos(): Promise<EventoFormulario[]> {
    const response = await axiosInstance.get<EventoFormulario[]>(`${ENDPOINT}/eventos`);
    return response.data;
  },

  async asignarFormularioAEvento(idEvento: number, idFormulario: number): Promise<EventoFormulario> {
    const response = await axiosInstance.put<{ data: EventoFormulario }>(
      `${ENDPOINT}/eventos/${idEvento}/asignar/${idFormulario}`
    );
    return response.data.data;
  },

  async desasignarFormularioDeEvento(idEvento: number): Promise<boolean> {
    const response = await axiosInstance.put<{ success: boolean }>(
      `${ENDPOINT}/eventos/${idEvento}/desasignar`
    );
    return response.data.success;
  },
};
