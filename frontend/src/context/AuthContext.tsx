import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";

export interface User {
  id: string;
  username: string;
  balance: number;
  lastDailyRewardAt: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setBalance: (b: number) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<User>("/api/auth/me");
      setUser(data);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const setBalance = useCallback((b: number) => {
    setUser((u) => (u ? { ...u, balance: b } : u));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe, setBalance }),
    [user, loading, login, register, logout, refreshMe, setBalance],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}