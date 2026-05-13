import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { useAuthStore } from "./store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _401Handled?: boolean;
    };

    // Only handle 401 errors that haven't been processed yet
    if (error.response?.status === 401 && config && !config._401Handled) {
      // Mark this request as handled to prevent infinite loops
      config._401Handled = true;

      // Only clear auth and redirect if we're not already on the login page
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        // Clear the auth state to remove invalid token
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
