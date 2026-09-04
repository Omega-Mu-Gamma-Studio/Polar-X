import axios, { AxiosError } from 'axios';

/**
 * Shared axios instance for every API call.
 * Auth token attachment is stubbed for Phase 0 — real JWT logic lands in Phase 7.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api';

export const AUTH_TOKEN_KEY = 'polarx_token';

export class ApiError extends Error {
  status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

// Request interceptor — attach the JWT once Phase 7 auth stores it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — normalize errors so pages can rely on err.message.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      // Phase 7 will route to the login screen + clear stale credentials here.
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    const message = error.response?.data?.error ?? error.message ?? 'Request failed';
    return Promise.reject(new ApiError(message, error.response?.status));
  }
);

export default api;
