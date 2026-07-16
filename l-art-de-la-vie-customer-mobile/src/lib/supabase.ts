import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "configuracion-pendiente";
export const supabase = createClient(url, key, { auth: { storage: globalThis.localStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
