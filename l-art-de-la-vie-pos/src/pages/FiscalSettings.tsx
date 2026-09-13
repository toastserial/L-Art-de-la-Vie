import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, FileText, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface FiscalSettingsData {
  legalName: string; tradeName: string; rtn: string; address: string; phone: string; email: string; cai: string;
  establishmentCode: string; emissionPointCode: string; documentTypeCode: string;
  rangeStart: number | null; rangeEnd: number | null; nextNumber: number | null;
  authorizationDate: string; deadlineDate: string; enabled: boolean; remaining?: number | null;
}

const empty: FiscalSettingsData = {
  legalName: "", tradeName: "L'Art de la Vie", rtn: "", address: "", phone: "", email: "", cai: "",
  establishmentCode: "000", emissionPointCode: "001", documentTypeCode: "01",
  rangeStart: null, rangeEnd: null, nextNumber: null, authorizationDate: "", deadlineDate: "", enabled: false,
};

export default function FiscalSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState<FiscalSettingsData>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api<FiscalSettingsData>("/fiscal-settings").then(setForm).catch((reason) => toast({ title: "No se pudo cargar la configuración CAI", description: reason instanceof Error ? reason.message : undefined, variant: "destructive" })).finally(() => setLoading(false));
  }, [toast]);
  const field = <K extends keyof FiscalSettingsData>(key: K, value: FiscalSettingsData[K]) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      await api("/fiscal-settings", { method: "PUT", body: JSON.stringify(form) });
      toast({ title: form.enabled ? "Configuración fiscal activada" : "Borrador fiscal guardado" });
    } catch (reason) {
      toast({ title: "No se pudo guardar", description: reason instanceof Error ? reason.message : undefined, variant: "destructive" });
    } finally { setSaving(false); }
  };
  if (loading) return <div className="space-y-5"><Skeleton className="h-10 w-64" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-[420px] rounded-2xl" /></div>;
  const complete = Boolean(form.legalName && form.rtn.length === 14 && form.address && form.cai && form.rangeStart && form.rangeEnd && form.nextNumber && form.authorizationDate && form.deadlineDate);
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/60">Administración tributaria</p><h1 className="mt-1 text-3xl font-display font-bold">Preparación de factura CAI</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Guarda exactamente los datos entregados por SAR. Esta pantalla prepara el sistema; la emisión fiscal permanecerá apagada hasta completar y validar el rango.</p></div>
    <Card className={form.enabled ? "border-primary/30 bg-primary/5" : "border-accent/35 bg-accent/5"}><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${form.enabled ? "bg-primary text-primary-foreground" : "bg-accent/20 text-foreground"}`}>{form.enabled ? <BadgeCheck /> : <AlertTriangle />}</div><div className="flex-1"><p className="font-semibold">{form.enabled ? "Configuración CAI activa" : complete ? "Datos completos, pendientes de validación" : "Configuración incompleta"}</p><p className="mt-1 text-sm text-muted-foreground">{form.remaining != null ? `${form.remaining} correlativos disponibles.` : "Ingresa CAI, rango y fecha límite reales."}</p></div><div className="flex items-center gap-3"><Label htmlFor="fiscal-enabled">Activar</Label><Switch id="fiscal-enabled" checked={form.enabled} onCheckedChange={(value) => field("enabled", value)} disabled={!complete} /></div></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans text-lg"><ShieldCheck className="h-5 w-5 text-primary" />Datos del emisor</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
      <Field label="Razón social *" value={form.legalName} onChange={value => field("legalName", value)} />
      <Field label="Nombre comercial" value={form.tradeName} onChange={value => field("tradeName", value)} />
      <Field label="RTN (14 dígitos) *" value={form.rtn} maxLength={14} onChange={value => field("rtn", value.replace(/\D/g, ""))} />
      <Field label="Teléfono" value={form.phone} onChange={value => field("phone", value)} />
      <Field label="Correo" value={form.email} type="email" onChange={value => field("email", value)} />
      <div className="md:col-span-2"><Field label="Dirección fiscal completa *" value={form.address} onChange={value => field("address", value)} /></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 font-sans text-lg"><FileText className="h-5 w-5 text-primary" />Autorización y rango</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-3">
      <div className="md:col-span-3"><Field label="CAI *" value={form.cai} onChange={value => field("cai", value.toUpperCase())} /></div>
      <Field label="Establecimiento" value={form.establishmentCode} maxLength={3} onChange={value => field("establishmentCode", value.replace(/\D/g, ""))} />
      <Field label="Punto de emisión" value={form.emissionPointCode} maxLength={3} onChange={value => field("emissionPointCode", value.replace(/\D/g, ""))} />
      <Field label="Tipo documento" value={form.documentTypeCode} maxLength={2} onChange={value => field("documentTypeCode", value.replace(/\D/g, ""))} />
      <NumberField label="Inicio de rango *" value={form.rangeStart} onChange={value => field("rangeStart", value)} />
      <NumberField label="Fin de rango *" value={form.rangeEnd} onChange={value => field("rangeEnd", value)} />
      <NumberField label="Siguiente correlativo *" value={form.nextNumber} onChange={value => field("nextNumber", value)} />
      <Field label="Fecha de autorización *" value={form.authorizationDate} type="date" onChange={value => field("authorizationDate", value)} />
      <Field label="Fecha límite de emisión *" value={form.deadlineDate} type="date" onChange={value => field("deadlineDate", value)} />
    </CardContent></Card>
    <div className="flex flex-col justify-between gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"><p className="max-w-2xl text-xs leading-5 text-muted-foreground">No actives esta configuración con datos de prueba. Confirma razón social, RTN, CAI, rango y fecha límite contra el documento oficial y con la contadora.</p><Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{form.enabled ? "Guardar y activar" : "Guardar borrador"}</Button></div>
  </div>;
}

function Field({ label, value, onChange, type = "text", maxLength }: { label: string; value: string; onChange(value: string): void; type?: string; maxLength?: number }) { return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)} /></div>; }
function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange(value: number | null): void }) { return <div className="space-y-2"><Label>{label}</Label><Input type="number" min={1} value={value ?? ""} onChange={event => onChange(event.target.value ? Number(event.target.value) : null)} /></div>; }

