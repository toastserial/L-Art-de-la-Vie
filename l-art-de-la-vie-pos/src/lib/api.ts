import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(!isFormData ? { "Content-Type": "application/json" } : {}), ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...options?.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "No se pudo comunicar con el servidor" }));
    throw new Error(body.message ?? `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  return api<{ url: string }>("/product-images", { method: "POST", body: form });
}
