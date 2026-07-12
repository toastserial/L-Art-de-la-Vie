import { storeId, supabase } from "./supabase.js";
import { httpError } from "./validation.js";

export async function requireAuth(req, _res, next) {
  try {
    const [scheme, token] = (req.get("authorization") ?? "").split(" ");
    if (scheme !== "Bearer" || !token) throw httpError(401, "Inicia sesión para continuar");

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw httpError(401, "La sesión no es válida o expiró");

    const { data: membership, error: memberError } = await supabase
      .from("store_members")
      .select("role")
      .eq("store_id", storeId)
      .eq("user_id", user.id)
      .single();
    if (memberError || !membership) throw httpError(403, "Tu usuario no tiene acceso a esta tienda");
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

    req.auth = {
      userId: user.id,
      email: user.email,
      fullName: profile?.full_name || user.user_metadata?.full_name || user.email,
      role: membership.role
    };
    next();
  } catch (error) {
    next(error);
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) return next(httpError(403, "No tienes permiso para realizar esta acción"));
  next();
};
