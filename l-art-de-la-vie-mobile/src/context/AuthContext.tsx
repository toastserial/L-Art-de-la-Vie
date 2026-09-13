import type { Session } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { passwordResetUrl, supabase } from "../lib/supabase";
import type { AppUser } from "../types";

// Completa el regreso desde el navegador cuando Expo abre Google.
WebBrowser.maybeCompleteAuthSession();

interface AuthValue {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  canManage: boolean;
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
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
        setUser(await loadUser(next));
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
      setUser(await loadUser(data.session));
    } catch (reason) {
      await supabase.auth.signOut({ scope: "local" });
      throw reason;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // `native` evita que un entorno de desarrollo sustituya el retorno del
    // APK por una URL web/exp://. Debe coincidir con app.json y con la URL
    // adicional autorizada en Supabase: lartdelavie://**.
    const redirectTo = AuthSession.makeRedirectUri({
      native: "lartdelavie://auth/callback",
      scheme: "lartdelavie",
      path: "auth/callback",
    });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error || !data.url) {
      throw new Error("No pudimos abrir Google. Revisa la configuración del inicio de sesión.");
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Inicio de sesión cancelado");
    }
    if (result.type !== "success") {
      throw new Error("No pudimos terminar el inicio de sesión con Google.");
    }

    const code = new URL(result.url).searchParams.get("code");
    if (!code) throw new Error("Google no devolvió un código de acceso válido.");

    setLoading(true);
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !sessionData.session) {
      setLoading(false);
      throw new Error("No pudimos completar tu sesión con Google.");
    }

    setSession(sessionData.session);
    try {
      setUser(await loadUser(sessionData.session));
    } catch {
      await supabase.auth.signOut({ scope: "local" });
      setUser(null);
      throw new Error("Tu cuenta de Google no está autorizada para entrar al sistema.");
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
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: passwordResetUrl });
    if (error) throw new Error("No se pudo enviar el correo de recuperación");
  };

  const value = useMemo<AuthValue>(() => ({
    session, user, loading, signIn, signInWithGoogle, signOut, resetPassword,
    canManage: user?.role === "owner" || user?.role === "admin",
  }), [session, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
