import { storeId, supabase } from "./supabase.js";
import { httpError } from "./validation.js";

const displayName = (storedName, email) => {
  const cleanName = typeof storedName === "string" ? storedName.trim() : "";
  const username = typeof email === "string" ? email.split("@")[0].trim() : "";
  return cleanName && !cleanName.includes("@") ? cleanName : username || "Usuario";
};

async function identityFromRequest(req) {
  const [scheme, token] = (req.get("authorization") ?? "").split(" ");
  if (scheme !== "Bearer" || !token) throw httpError(401, "Inicia sesión para continuar");

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw httpError(401, "La sesión no es válida o expiró");
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: displayName(profile?.full_name || user.user_metadata?.full_name, user.email),
    role: null,
  };
}

export async function requireUserAuth(req, _res, next) {
  try {
    req.auth = await identityFromRequest(req);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, _res, next) {
  try {
    const identity = await identityFromRequest(req);
    const { data: membership, error } = await supabase
      .from("store_members")
      .select("role")
      .eq("store_id", storeId)
      .eq("user_id", identity.userId)
      .single();
    if (error || !membership) throw httpError(403, "Tu usuario no tiene acceso a esta tienda");
    req.auth = { ...identity, role: membership.role };
    next();
  } catch (error) {
    next(error);
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) return next(httpError(403, "No tienes permiso para realizar esta acción"));
  next();
};
