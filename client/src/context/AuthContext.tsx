import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearToken,
  fetchMe,
  hasStoredToken,
  login as apiLogin,
  register as apiRegister,
  storeToken,
  type AuthUser,
} from '@/services/authApi';
import { disconnectSocket } from '@/services/socket';

interface AuthContextValue {
  /** The authenticated user, or null when logged out. */
  user: AuthUser | null;
  /** True while a stored token is being validated against /auth/me on boot. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: { name: string; email: string; password: string; role?: string; station_id?: string | null }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On boot: if a token exists, restore the session via /auth/me. If that fails
  // (expired/invalid token) the api interceptor already cleared it — end logged out.
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!hasStoredToken()) {
        setInitializing(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    storeToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; role?: string; station_id?: string | null }) => {
      const response = await apiRegister(payload);
      storeToken(response.token);
      setUser(response.user);
      return response.user;
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    disconnectSocket();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}