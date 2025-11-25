import axiosInstance from "@/utils/axios";
import type { Country } from "@/types/country";

const ENDPOINT = "/api/Country";
const CACHE_KEY = "countries_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

interface CachedData {
  data: Country[];
  timestamp: number;
}

export const countryService = {
  async getAll(): Promise<Country[]> {
    // Intentar obtener datos del caché
    const cached = this.getFromCache();
    if (cached) {
      return cached;
    }

    // Si no hay caché válido, hacer la petición
    const response = await axiosInstance.get<Country[]>(ENDPOINT);

    // Guardar en caché
    this.saveToCache(response.data);

    return response.data;
  },

  async getByCode(code: string): Promise<Country> {
    const response = await axiosInstance.get<Country>(`${ENDPOINT}/${code}`);
    return response.data;
  },

  getFromCache(): Country[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp }: CachedData = JSON.parse(cached);
      const now = Date.now();

      // Verificar si el caché expiró
      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  },

  saveToCache(data: Country[]): void {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  },

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  },
};
