import axiosInstance from "@/utils/axios";
import type { Tutor, TutorFormData } from "@/types/tutor";

const ENDPOINT = "/api/Tutor";

export const tutorService = {
  async getAll(): Promise<Tutor[]> {
    const response = await axiosInstance.get<Tutor[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<Tutor> {
    const response = await axiosInstance.get<Tutor>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(tutor: TutorFormData): Promise<Tutor> {
    const response = await axiosInstance.post<Tutor>(ENDPOINT, tutor);
    return response.data;
  },

  async update(id: number, tutor: TutorFormData): Promise<Tutor> {
    const response = await axiosInstance.put<Tutor>(`${ENDPOINT}/${id}`, tutor);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string; success: boolean }> {
    const response = await axiosInstance.delete<{ message: string; success: boolean }>(`${ENDPOINT}/${id}`);
    return response.data;
  },
};
