import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "configuracion-pendiente";
export const supabase = createClient(url, key, { auth: { storage: globalThis.localStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });

export const authRedirectUrl =
  process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ||
  "https://l-art-de-la-vie-knyu.vercel.app/auth/confirmed";

/** Completa una confirmación de correo o recuperación abierta mediante deep link. */
export async function handleAuthDeepLink(incomingUrl: string): Promise<"confirmation" | "recovery" | null> {
  if (!incomingUrl.startsWith("lartdelavieclientes://")) return null;

  const query = incomingUrl.split("?")[1]?.split("#")[0] || "";
  const fragment = incomingUrl.split("#")[1] || "";
  const params = new URLSearchParams([query, fragment].filter(Boolean).join("&"));
  const authType = params.get("type") === "recovery" ? "recovery" : "confirmation";
  const errorDescription = params.get("error_description");
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));

  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return authType;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return authType;
  }

  return null;
}
