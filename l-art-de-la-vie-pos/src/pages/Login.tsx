import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await signIn(email, password); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión"); }
    finally { setSubmitting(false); }
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) return;
    setResetting(true);
    try {
      await resetPassword(resetEmail);
      setResetOpen(false);
      toast({ title: "Correo enviado", description: "Revisa tu bandeja para restablecer la contraseña." });
    } catch (reason) {
      toast({ title: "No se pudo enviar", description: reason instanceof Error ? reason.message : undefined, variant: "destructive" });
    } finally { setResetting(false); }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f1efe7] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)] lg:p-4">
      <section className="relative min-h-[250px] overflow-hidden bg-primary lg:min-h-[calc(100vh-2rem)] lg:rounded-[2rem]">
        <img src="/login-boutique.jpg" alt="Vela decorativa de L'Art de la Vie" className="absolute inset-0 h-full w-full object-cover object-[center_58%] lg:object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/25 via-primary/10 to-primary/95 lg:bg-gradient-to-r lg:from-primary/20 lg:via-primary/30 lg:to-primary/80" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.45),transparent_24%)]" />

        <div className="relative flex h-full min-h-[250px] flex-col justify-between p-5 text-primary-foreground sm:p-8 lg:min-h-[calc(100vh-2rem)] lg:p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/30 bg-primary/75 shadow-xl backdrop-blur-md">
              <img src="/lartdela.png" alt="L'Art de la Vie" className="h-[4.6rem] w-[4.6rem] max-w-none object-contain" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-none">L'Art de la Vie</p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">Boutique & gestión</p>
            </div>
          </div>

          <div className="hidden max-w-2xl lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> El arte de vivir
            </div>
            <h1 className="max-w-xl font-display text-5xl leading-[1.04] xl:text-7xl">Tu boutique, organizada con intención.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">Ventas, inventario y caja reunidos en un espacio creado para trabajar con claridad.</p>
          </div>

          <div className="hidden items-center justify-between gap-4 text-xs text-white/65 lg:flex">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Acceso privado y protegido</span>
            <span>Siguatepeque · Honduras</span>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 flex items-center justify-center rounded-t-[2rem] bg-[#f8f7f2] px-5 pb-10 pt-9 sm:px-8 lg:mt-0 lg:rounded-none lg:bg-transparent lg:px-12 lg:py-10 xl:px-20">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-primary/60">Portal del equipo</p>
              <h2 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-[2.75rem]">Qué gusto verte.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Ingresa a tu espacio de trabajo para comenzar el día.</p>
            </div>
            <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/10 bg-white text-primary shadow-sm sm:grid"><LockKeyhole className="h-5 w-5" /></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Correo electrónico</Label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/55" /><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.com" className="h-14 rounded-2xl border-black/10 bg-white pl-11 shadow-sm transition-shadow focus-visible:shadow-[0_0_0_4px_rgba(195,164,71,.12)]" /></div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between"><Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Contraseña</Label><button type="button" onClick={() => { setResetEmail(email); setResetOpen(true); }} className="text-xs font-semibold text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">¿La olvidaste?</button></div>
              <div className="relative"><KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/55" /><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl border-black/10 bg-white px-11 shadow-sm transition-shadow focus-visible:shadow-[0_0_0_4px_rgba(195,164,71,.12)]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            {error && <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="group h-14 w-full rounded-2xl text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(4,61,15,.8)]" disabled={submitting || loading}>{(submitting || loading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}Entrar al sistema</Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary/60" /> Solo personal autorizado</div>
        </div>
      </section>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border-0 p-0 sm:max-w-md"><div className="bg-primary px-7 py-6 text-primary-foreground"><div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><KeyRound className="h-5 w-5 text-accent" /></div><DialogHeader><DialogTitle className="font-display text-2xl text-primary-foreground">Recuperar contraseña</DialogTitle><DialogDescription className="text-primary-foreground/65">Te enviaremos un enlace seguro para que elijas una nueva.</DialogDescription></DialogHeader></div><div className="space-y-5 px-7 py-6"><div className="space-y-2"><Label htmlFor="reset-email">Correo electrónico</Label><Input id="reset-email" type="email" autoComplete="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="h-12 rounded-xl" /></div><DialogFooter><Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button><Button onClick={handleReset} disabled={resetting || !resetEmail.trim()}>{resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar enlace</Button></DialogFooter></div></DialogContent>
      </Dialog>
    </main>
  );
}
