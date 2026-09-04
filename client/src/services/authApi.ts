import api, { AUTH_TOKEN_KEY } from './api';


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  stationId: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthDataResponse {
  data: AuthResponse;
}

/** POST /api/auth/login — returns { token, user }. */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthDataResponse>('/auth/login', { email, password });
  return data.data;
}

/** POST /api/auth/register — creates an account and returns { token, user }. */
export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
  station_id?: string | null;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthDataResponse>('/auth/register', payload);
  return data.data;
}

/** GET /api/auth/me — hydrates the user from the stored JWT. */
export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<{ data: { user: AuthUser } }>('/auth/me');
  return data.data.user;
}

/** Persist the JWT (the axios interceptor attaches it to every request). */
export function storeToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/** Clear the stored JWT. */
export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/** Whether a token is currently stored (used to decide restore-vs-login on boot). */
export function hasStoredToken(): boolean {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}