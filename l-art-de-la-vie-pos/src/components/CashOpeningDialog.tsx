import { useEffect, useState } from "react";
import { ArrowLeft, Boxes, Loader2, LockKeyhole, WalletCards } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CashOpeningDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onInventory(): void;
}

export function CashOpeningDialog({ open, onOpenChange, onInventory }: CashOpeningDialogProps) {
  const { cashOpening, openCash } = useStore();
  const { user } = useAuth();
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"choice" | "opening">("choice");

  useEffect(() => { if (!open) setStep("choice"); }, [open]);

  const handleOpen = async () => {
    if (amount < 0 || !Number.isFinite(amount)) return setError("Ingresa un fondo inicial válido.");
    setSaving(true); setError("");
    try { await openCash(amount, note.trim() || undefined); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo abrir la caja"); }
    finally { setSaving(false); }
  };

  if (cashOpening) return null;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-lg">
      {step === "choice" ? <>
        <div className="bg-primary px-7 py-7 text-primary-foreground sm:px-9">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><WalletCards className="h-6 w-6 text-accent" /></div>
          <DialogHeader className="text-left"><DialogTitle className="font-display text-3xl text-primary-foreground">¿Qué quieres hacer primero?</DialogTitle><DialogDescription className="mt-2 text-primary-foreground/65">La caja puede esperar mientras organizas el catálogo. Te recordaremos abrirla antes de cobrar.</DialogDescription></DialogHeader>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-7">
          <button type="button" onClick={() => setStep("opening")} className="group rounded-2xl border border-primary/15 bg-primary/[0.04] p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><WalletCards className="h-5 w-5" /></div><p className="font-semibold text-foreground">Abrir caja</p><p className="mt-1 text-sm leading-5 text-muted-foreground">Registrar el fondo y comenzar a vender.</p>
          </button>
          <button type="button" onClick={onInventory} className="group rounded-2xl border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-primary"><Boxes className="h-5 w-5" /></div><p className="font-semibold text-foreground">Ir a inventario</p><p className="mt-1 text-sm leading-5 text-muted-foreground">Agregar productos, fotos o categorías.</p>
          </button>
          <p className="col-span-full text-center text-xs text-muted-foreground">Las ventas permanecerán bloqueadas hasta completar la apertura.</p>
        </div>
      </> : <div className="p-6 sm:p-8">
      <DialogHeader className="items-center text-center">
        <div className="mb-2 h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center"><WalletCards className="h-7 w-7" /></div>
        <DialogTitle className="text-2xl">Apertura de caja</DialogTitle>
        <DialogDescription>Registra el efectivo disponible antes de comenzar las ventas de hoy.</DialogDescription>
      </DialogHeader>
      <div className="space-y-5 py-3">
        <div className="rounded-lg border bg-muted/40 p-3 flex items-center gap-3 text-sm">
          <LockKeyhole className="h-4 w-4 text-primary" />
          <div><p className="font-medium">Responsable</p><p className="text-muted-foreground">{user?.fullName}</p></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="opening-cash">Fondo inicial en efectivo</Label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">L</span><Input id="opening-cash" type="number" min={0} step="0.01" autoFocus value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="h-12 pl-9 text-lg font-semibold" /></div>
          <p className="text-xs text-muted-foreground">Puedes ingresar 0 si la caja comienza sin fondo.</p>
        </div>
        <div className="space-y-2"><Label htmlFor="opening-note">Nota opcional</Label><Textarea id="opening-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ej. Fondo entregado por administración" rows={2} /></div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter className="gap-2 sm:flex-row"><Button variant="outline" onClick={() => setStep("choice")} disabled={saving}><ArrowLeft className="mr-2 h-4 w-4" />Atrás</Button><Button className="flex-1 h-11" onClick={handleOpen} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Abrir caja y comenzar</Button></DialogFooter>
      </div>}
    </DialogContent>
  </Dialog>;
}
