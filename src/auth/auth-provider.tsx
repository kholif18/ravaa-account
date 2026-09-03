import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import * as authApi from "../lib/api/auth";
import { setAccessToken, refreshViaCookie, clearRefreshState } from "../lib/api/client";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

type AuthContextType = {
  state: AuthState;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authApi.getCurrentUser();
      setState({ status: "authenticated", user });
    } catch {
      setAccessToken(null);
      clearRefreshState();
      setState({ status: "unauthenticated" });
    }
  }, []);

  // Refresh-on-boot: coba pakai httpOnly cookie
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const newToken = await refreshViaCookie();
        if (cancelled) return;
        if (newToken) {
          // tryRefresh already set token via client; now fetch user
          const { user } = await authApi.getCurrentUser();
          if (cancelled) return;
          setState({ status: "authenticated", user });
        } else {
          setState({ status: "unauthenticated" });
        }
      } catch {
        if (!cancelled) setState({ status: "unauthenticated" });
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.login(identifier, password);
    setAccessToken(result.accessToken);
    setState({ status: "authenticated", user: result.user });
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string, displayName?: string) => {
      const result = await authApi.register(email, username, password, displayName);
      setAccessToken(result.accessToken);
      setState({ status: "authenticated", user: result.user });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API fails
    }
    setAccessToken(null);
    clearRefreshState();
    setState({ status: "unauthenticated" });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
