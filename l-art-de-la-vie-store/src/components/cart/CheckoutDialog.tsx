import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatL } from "@/lib/currency";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { hasWhatsapp } from "@/lib/config";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: Props) {
  const { items, subtotal, clear, close } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    delivery: "pickup" as "pickup" | "shipping",
    address: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Por favor ingresa tu nombre.");
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 8) return setError("Ingresa un teléfono válido.");
    if (form.delivery === "shipping" && !form.address.trim()) {
      return setError("Ingresa la dirección de entrega.");
    }
    if (items.length === 0) return setError("Tu bolsa está vacía.");
    if (!hasWhatsapp()) return setError("WhatsApp no está configurado.");

    const msg = buildOrderMessage(items, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      delivery: form.delivery,
      address: form.address.trim() || undefined,
      note: form.note.trim() || undefined,
    });
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
    clear();
    onOpenChange(false);
    close();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="fixed inset-0 z-50 bg-[color:var(--ink)]/55"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
              >
                <div
                  className="flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-[color:var(--paper)] shadow-2xl sm:rounded-2xl"
                  style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                  <div className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-5">
                    <div>
                      <Dialog.Title className="font-serif text-xl italic text-[color:var(--forest)]">
                        Confirmar pedido
                      </Dialog.Title>
                      <Dialog.Description className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                        Enviaremos el resumen por WhatsApp
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        aria-label="Cerrar"
                        className="inline-grid min-h-11 min-w-11 place-items-center rounded-full text-[color:var(--forest)] hover:bg-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nombre completo" required>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={inputCls}
                            autoComplete="name"
                          />
                        </Field>
                        <Field label="Teléfono" required>
                          <input
                            required
                            type="tel"
                            inputMode="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="9999-9999"
                            className={inputCls}
                            autoComplete="tel"
                          />
                        </Field>
                      </div>

                      <fieldset>
                        <legend className="mb-2 text-xs uppercase tracking-[0.22em] text-[color:var(--forest-2)]">
                          Tipo de entrega
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { v: "pickup", label: "Recoger en tienda" },
                            { v: "shipping", label: "Envío nacional" },
                          ].map((o) => {
                            const active = form.delivery === o.v;
                            return (
                              <label
                                key={o.v}
                                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm transition ${
                                  active
                                    ? "border-[color:var(--forest)] bg-[color:var(--forest)] text-[color:var(--cream)]"
                                    : "border-[color:var(--border)] bg-transparent hover:border-[color:var(--forest)]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="delivery"
                                  value={o.v}
                                  checked={active}
                                  onChange={() =>
                                    setForm({ ...form, delivery: o.v as "pickup" | "shipping" })
                                  }
                                  className="sr-only"
                                />
                                {o.label}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      {form.delivery === "shipping" ? (
                        <Field label="Ciudad y dirección de entrega" required>
                          <textarea
                            required
                            rows={2}
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className={inputCls}
                            placeholder="Ciudad, colonia, calle y referencias"
                          />
                        </Field>
                      ) : null}

                      <Field label="Nota (opcional)">
                        <textarea
                          rows={2}
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          className={inputCls}
                          placeholder="Preferencias, envoltura, mensaje…"
                        />
                      </Field>

                      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--cream)] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--forest-2)]">
                          Resumen
                        </div>
                        <ul className="mt-3 space-y-2 text-sm">
                          {items.map((it) => (
                            <li key={it.id} className="flex items-baseline justify-between gap-3">
                              <span className="min-w-0 truncate text-[color:var(--ink)]">
                                {it.quantity} × {it.name}
                              </span>
                              <span className="shrink-0 text-[color:var(--ink-muted)]">
                                {formatL(it.price * it.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex items-baseline justify-between border-t border-[color:var(--gold)]/20 pt-3">
                          <span className="text-sm uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
                            Total
                          </span>
                          <span className="font-serif text-2xl text-[color:var(--forest)]">
                            {formatL(subtotal)}
                          </span>
                        </div>
                      </div>

                      {error ? (
                        <div
                          role="alert"
                          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          {error}
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-[color:var(--border)] bg-[color:var(--paper)] px-6 py-4">
                      <button
                        type="submit"
                        className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--forest)] px-6 py-3 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                      >
                        <Send className="h-4 w-4" />
                        Enviar pedido por WhatsApp
                      </button>
                      <p className="mt-3 text-center text-xs text-[color:var(--ink-muted)]">
                        El envío y su costo se confirman por WhatsApp. No procesamos tarjetas.
                      </p>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

const inputCls =
  "w-full rounded-md border border-[color:var(--border)] bg-[color:var(--paper)] px-4 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:border-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-[color:var(--forest-2)]">
        {label} {required ? <span className="text-[color:var(--gold)]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
