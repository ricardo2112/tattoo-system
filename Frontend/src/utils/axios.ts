import axios, { AxiosError, AxiosResponse } from "axios";

// Base URL desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_BACKEND;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token JWT en las peticiones (cuando se implemente autenticación)
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) =>
    Promise.reject(error.response?.data || "Something went wrong")
);

export default axiosInstance;
