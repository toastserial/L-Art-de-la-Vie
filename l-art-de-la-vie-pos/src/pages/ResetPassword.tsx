import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const { session, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (password.length < 8) return setError("Usa al menos 8 caracteres.");
    if (password !== confirmation) return setError("Las contraseñas no coinciden.");
    setSaving(true);
    try { await updatePassword(password); await signOut(); navigate("/login", { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar"); }
    finally { setSaving(false); }
  };

  return <main className="min-h-screen bg-primary grid place-items-center p-6"><div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl"><div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mb-5"><KeyRound className="h-6 w-6" /></div><h1 className="text-3xl font-bold">Nueva contraseña</h1><p className="mt-2 mb-7 text-muted-foreground">Elige una contraseña segura para tu cuenta.</p>{!session ? <div className="space-y-4"><p className="rounded-lg bg-muted p-3 text-sm">El enlace no es válido o ya expiró.</p><Button className="w-full" onClick={() => navigate("/login")}>Volver al acceso</Button></div> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="new-password">Nueva contraseña</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirmar contraseña</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar contraseña</Button></form>}</div></main>;
}
