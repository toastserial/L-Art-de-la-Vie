import { supabase } from "./supabase";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://l-art-de-la-vie.onrender.com/api").replace(/\/$/, "");

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "No se pudo comunicar con el servidor" }));
    throw new Error(body.message || `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function uploadProductImage(uri: string, mimeType?: string | null, fileName?: string | null) {
  const form = new FormData();
  form.append("image", {
    uri,
    type: mimeType || "image/jpeg",
    name: fileName || `producto-${Date.now()}.jpg`,
  } as unknown as Blob);
  return api<{ url: string }>("/product-images", { method: "POST", body: form });
}
