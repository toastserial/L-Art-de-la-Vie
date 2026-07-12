import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError = !url || !publishableKey
  ? "Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en l-art-de-la-vie-pos/.env"
  : null;

export const supabase = createClient(url || "http://127.0.0.1:54321", publishableKey || "configuracion-pendiente", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
