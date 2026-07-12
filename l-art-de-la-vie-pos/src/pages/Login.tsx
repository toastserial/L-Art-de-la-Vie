import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
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
    <main className="min-h-screen bg-[#f6f5ef] grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-14 flex-col justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,hsl(var(--accent))_0,transparent_28%),radial-gradient(circle_at_80%_75%,hsl(var(--accent))_0,transparent_24%)]" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-full border border-accent/60 grid place-items-center"><span className="font-display text-xl text-accent">L</span></div>
          <div><p className="font-display text-xl font-semibold">L'Art de la Vie</p><p className="text-xs tracking-[0.24em] uppercase text-primary-foreground/60">Tienda & Gestión</p></div>
        </div>
        <div className="relative max-w-xl space-y-6">
          <p className="text-accent text-sm font-semibold tracking-[0.22em] uppercase">Administración con elegancia</p>
          <h1 className="font-display text-5xl xl:text-6xl leading-[1.08]">Cada detalle de tu tienda, en armonía.</h1>
          <p className="text-primary-foreground/70 text-lg max-w-lg">Ventas, inventario y cierres de caja protegidos en un solo lugar.</p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-primary-foreground/60"><ShieldCheck className="h-4 w-4 text-accent" /> Acceso seguro para personal autorizado</div>
      </section>

      <section className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2"><span className="font-display text-xl font-bold text-primary">L'Art de la Vie</span></div>
        <div className="w-full max-w-md">
          <div className="bg-white border shadow-[0_24px_70px_-35px_rgba(4,61,15,0.35)] rounded-2xl p-7 sm:p-10">
            <div className="mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mb-5"><LockKeyhole className="h-6 w-6" /></div>
              <h2 className="font-display text-3xl font-bold">Bienvenido</h2>
              <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.com" className="h-11 pl-10" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label htmlFor="password">Contraseña</Label><button type="button" onClick={() => { setResetEmail(email); setResetOpen(true); }} className="text-xs font-medium text-primary hover:underline">¿La olvidaste?</button></div>
                <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 px-10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              </div>
              {error && <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="w-full h-11" disabled={submitting || loading}>{(submitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ingresar</Button>
            </form>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">Sistema privado de L'Art de la Vie</p>
        </div>
      </section>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent><DialogHeader><DialogTitle>Recuperar contraseña</DialogTitle><DialogDescription>Te enviaremos un enlace seguro a tu correo.</DialogDescription></DialogHeader><div className="space-y-2 py-2"><Label htmlFor="reset-email">Correo electrónico</Label><Input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /></div><DialogFooter><Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button><Button onClick={handleReset} disabled={resetting || !resetEmail.trim()}>{resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar enlace</Button></DialogFooter></DialogContent>
      </Dialog>
    </main>
  );
}
