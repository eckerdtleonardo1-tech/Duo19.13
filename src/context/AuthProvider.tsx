"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}


/**
 * Confirma contra el servidor que la cookie de sesión realmente quedó guardada.
 *
 * El endpoint de login devuelve el usuario junto con el Set-Cookie, pero si el
 * navegador descarta esa cookie (modo estricto, bloqueo de terceros, HTTP sin
 * TLS) el header mostraría al usuario como logueado mientras cada página del
 * servidor lo rechaza: el síntoma es "me pide login estando logueado".
 */
async function fetchSessionUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

const SESSION_NOT_PERSISTED =
  "Iniciaste sesión pero el navegador no guardó la cookie de sesión. Revisá que no estén bloqueadas las cookies para este sitio.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSessionUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "No se pudo iniciar sesión"));
    }
    await res.json();

    const sessionUser = await fetchSessionUser();
    if (!sessionUser) throw new Error(SESSION_NOT_PERSISTED);

    setUser(sessionUser);
    router.refresh();
  }, [router]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "No se pudo registrar la cuenta"));
      }
      await res.json();

      const sessionUser = await fetchSessionUser();
      if (!sessionUser) throw new Error(SESSION_NOT_PERSISTED);

      setUser(sessionUser);
      router.refresh();
    },
    [router]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
