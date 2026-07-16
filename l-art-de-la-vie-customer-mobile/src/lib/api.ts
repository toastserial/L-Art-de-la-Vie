import { supabase } from "./supabase";
const base = (process.env.EXPO_PUBLIC_API_URL || "https://l-art-de-la-vie.onrender.com/api").replace(/\/$/, "");
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${base}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "No se pudo conectar con la tienda");
  return body as T;
}
