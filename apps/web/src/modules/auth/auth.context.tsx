import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentSession,
  loginRequest,
  logoutRequest,
} from "./auth.service";
import type { AuthContextValue, AuthTenant, AuthUser } from "./auth.types";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    const session = await getCurrentSession();

    if (!session) {
      setUser(null);
      setTenant(null);
      return;
    }

    setUser(session.user);
    setTenant(session.tenant);
  }

  async function login(email: string, password: string) {
    await loginRequest(email, password);
    await refreshSession();
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setTenant(null);
      navigate("/login", { replace: true });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const session = await getCurrentSession();

        if (!isMounted) {
          return;
        }

        setUser(session?.user ?? null);
        setTenant(session?.tenant ?? null);
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);

        if (!isMounted) {
          return;
        }

        setUser(null);
        setTenant(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    tenant,
    isAuthenticated: Boolean(user && tenant),
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
