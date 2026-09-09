import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (password.length < 8) return setError("Usa al menos 8 caracteres.");
    if (password !== confirmation) return setError("Las contraseñas no coinciden.");
    setSaving(true);
    try { await updatePassword(password); await signOut(); navigate("/login", { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar"); }
    finally { setSaving(false); }
  };

  return <main className="relative min-h-screen overflow-hidden bg-[#f1efe7] px-5 py-8 sm:grid sm:place-items-center">
    <div className="absolute inset-0">
      <img src="/login-boutique.jpg" alt="" className="h-full w-full object-cover opacity-20 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f7f2]/95 via-[#f8f7f2]/90 to-primary/20" />
    </div>
    <section className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_30px_90px_-35px_rgba(4,61,15,.45)] backdrop-blur-xl">
      <div className="bg-primary px-7 py-7 text-primary-foreground sm:px-10 sm:py-9">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3"><img src="/lartdela.png" alt="L'Art de la Vie" className="h-12 w-12 rounded-full object-contain" /><div><p className="font-display text-lg leading-none">L'Art de la Vie</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-accent">Acceso seguro</p></div></div>
          <ShieldCheck className="h-5 w-5 text-accent" />
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><KeyRound className="h-6 w-6 text-accent" /></div>
        <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">Crea tu nueva contraseña.</h1>
        <p className="mt-3 text-sm leading-6 text-primary-foreground/65">Elige una clave privada y fácil de recordar para recuperar tu acceso.</p>
      </div>

      <div className="px-7 py-7 sm:px-10 sm:py-9">
        {!session ? <div className="space-y-5">
          <p className="rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm leading-6">El enlace no es válido o ya expiró. Solicita uno nuevo desde la pantalla de acceso.</p>
          <Button className="h-12 w-full rounded-xl" onClick={() => navigate("/login")}><ArrowLeft className="mr-2 h-4 w-4" />Volver al acceso</Button>
        </div> : <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="new-password">Nueva contraseña</Label><div className="relative"><Input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl pr-11" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-primary" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirmar contraseña</Label><Input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="h-12 rounded-xl" /></div>
          {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar y volver al acceso</Button>
        </form>}
      </div>
    </section>
  </main>;
}
