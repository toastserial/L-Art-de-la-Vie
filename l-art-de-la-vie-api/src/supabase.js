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
    const known = result.error.code === "23505"
      ? { status: 409, message: "El registro ya existe" }
      : result.error.code === "PGRST116"
        ? { status: 404, message: "Registro no encontrado" }
        : result.error.code === "P0001"
          ? { status: 409, message: result.error.message }
          : null;
    const error = new Error(known?.message ?? "Falló una operación de base de datos");
    error.status = known?.status ?? 500;
    error.code = result.error.code ?? "DATABASE_ERROR";
    error.expose = !!known;
    error.databaseMessage = result.error.message;
    throw error;
  }
  return result.data;
}
