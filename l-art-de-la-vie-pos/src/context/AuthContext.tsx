import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

export type StoreRole = "owner" | "admin" | "cashier";
export interface AppUser { id: string; email: string; fullName: string; role: StoreRole }

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  canManage: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
type SessionProfile = Pick<AppUser, "fullName" | "role">;

const displayName = (name: string, email: string) => {
  const cleanName = name.trim();
  return cleanName && !cleanName.includes("@") ? cleanName : email.split("@")[0] || "Usuario";
};

const loadUser = async (session: Session): Promise<AppUser> => {
  const profile = await api<SessionProfile>("/auth/me");
  const email = session.user.email ?? "";
  return { id: session.user.id, email, ...profile, fullName: displayName(profile.fullName, email) };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const syncSession = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) { setUser(null); setLoading(false); return; }
      try { setUser(await loadUser(nextSession)); }
      catch { await supabase.auth.signOut(); setUser(null); }
      finally { if (active) setLoading(false); }
    };
    supabase.auth.getSession().then(({ data }) => syncSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => syncSession(nextSession), 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setLoading(false); throw new Error("Correo o contraseña incorrectos"); }
    setSession(data.session);
    try { setUser(await loadUser(data.session)); }
    catch (error) { await supabase.auth.signOut(); throw error; }
    finally { setLoading(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setUser(null); };
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw new Error("No se pudo enviar el correo de recuperación");
  };
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error("No se pudo actualizar la contraseña");
  };

  return <AuthContext.Provider value={{ session, user, loading, signIn, signOut, resetPassword, updatePassword, canManage: user?.role === "owner" || user?.role === "admin" }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
