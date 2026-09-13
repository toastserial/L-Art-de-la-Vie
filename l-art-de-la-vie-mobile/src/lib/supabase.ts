import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const passwordResetUrl = process.env.EXPO_PUBLIC_PASSWORD_RESET_URL
  || "https://l-art-de-la-vie.vercel.app/reset-password";

export const supabaseConfigError = !url || !publishableKey
  ? "Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env"
  : null;

export const supabase = createClient(
  url || "http://127.0.0.1:54321",
  publishableKey || "configuracion-pendiente",
  {
    auth: {
      storage: globalThis.localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // El flujo PKCE permite intercambiar de forma segura el código que
      // devuelve Google por una sesión dentro de la app nativa.
      flowType: "pkce",
    },
  },
);
