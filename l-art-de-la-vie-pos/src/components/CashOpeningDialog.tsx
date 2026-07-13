import { useState } from "react";
import { Loader2, LockKeyhole, WalletCards } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CashOpeningDialog() {
  const { cashOpening, openCash } = useStore();
  const { user } = useAuth();
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = async () => {
    if (amount < 0 || !Number.isFinite(amount)) return setError("Ingresa un fondo inicial válido.");
    setSaving(true); setError("");
    try { await openCash(amount, note.trim() || undefined); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo abrir la caja"); }
    finally { setSaving(false); }
  };

  return <Dialog open={!cashOpening}>
    <DialogContent className="sm:max-w-md" onEscapeKeyDown={(event) => event.preventDefault()} onInteractOutside={(event) => event.preventDefault()}>
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
      <DialogFooter><Button className="w-full h-11" onClick={handleOpen} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Abrir caja y comenzar</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
