import type { Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { AppUser } from "../types";

interface AuthValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  canManage: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const sync = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        setUser(await api<AppUser>("/auth/me"));
      } catch {
        await supabase.auth.signOut({ scope: "local" });
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => sync(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setTimeout(() => sync(next), 0));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session) {
      setLoading(false);
      throw new Error("Correo o contraseña incorrectos");
    }
    setSession(data.session);
    try {
      setUser(await api<AppUser>("/auth/me"));
    } catch (reason) {
      await supabase.auth.signOut({ scope: "local" });
      throw reason;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw new Error("No se pudo enviar el correo de recuperación");
  };

  const value = useMemo<AuthValue>(() => ({
    session, user, loading, signIn, signOut, resetPassword,
    canManage: user?.role === "owner" || user?.role === "admin",
  }), [session, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
