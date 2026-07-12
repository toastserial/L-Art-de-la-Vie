import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env");
}

export const storeId = process.env.SUPABASE_STORE_ID ?? "00000000-0000-0000-0000-000000000001";
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export function unwrap(result) {
  if (result.error) {
    const error = new Error(result.error.message);
    error.status = result.error.code === "23505" ? 409 : result.error.code === "PGRST116" ? 404 : 400;
    throw error;
  }
  return result.data;
}
