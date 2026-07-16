import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatL } from "@/lib/currency";
import { CartItem } from "./CartItem";
import { CheckoutDialog } from "./CheckoutDialog";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, count } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutRequested, setCheckoutRequested] = useState(false);

  const continueToCheckout = () => {
    setCheckoutRequested(true);
    close();
  };

  const finishDrawerExit = () => {
    if (!checkoutRequested) return;
    setCheckoutRequested(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(v) => !v && close()}>
        <AnimatePresence onExitComplete={finishDrawerExit}>
          {isOpen ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="fixed inset-0 z-40 bg-[color:var(--ink)]/50"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.aside
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col bg-[color:var(--paper)] shadow-2xl will-change-transform"
                  style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                  <div className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-5">
                    <div>
                      <Dialog.Title className="font-serif text-xl italic text-[color:var(--forest)]">
                        Mi bolsa
                      </Dialog.Title>
                      <Dialog.Description className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                        {count} {count === 1 ? "artículo" : "artículos"}
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        aria-label="Cerrar bolsa"
                        className="inline-grid min-h-11 min-w-11 place-items-center rounded-full text-[color:var(--forest)] hover:bg-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6">
                    {items.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                        <ShoppingBag
                          className="h-8 w-8 text-[color:var(--ink-muted)]"
                          strokeWidth={1.4}
                        />
                        <div>
                          <h3 className="font-serif text-2xl text-[color:var(--ink)]">
                            Tu bolsa está vacía
                          </h3>
                          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
                            Explora la colección y agrega tus favoritos.
                          </p>
                        </div>
                        <Dialog.Close asChild>
                          <a
                            href="#coleccion"
                            className="mt-2 inline-flex min-h-11 items-center rounded-full bg-[color:var(--forest)] px-6 py-2.5 text-sm text-[color:var(--cream)] hover:bg-[color:var(--forest-2)]"
                          >
                            Ver colección
                          </a>
                        </Dialog.Close>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[color:var(--border)]">
                        {items.map((it) => (
                          <CartItem key={it.id} item={it} />
                        ))}
                      </ul>
                    )}
                  </div>

                  {items.length > 0 ? (
                    <div className="border-t border-[color:var(--border)] bg-[color:var(--cream)] px-6 py-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
                          Total estimado
                        </span>
                        <span className="font-serif text-2xl text-[color:var(--forest)]">
                          {formatL(subtotal)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[color:var(--ink-muted)]">
                        La tienda confirmará disponibilidad y detalles finales por WhatsApp.
                      </p>
                      <button
                        type="button"
                        onClick={continueToCheckout}
                        className="mt-4 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-[color:var(--forest)] px-6 py-3 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                      >
                        Continuar pedido
                      </button>
                    </div>
                  ) : null}
                </motion.aside>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
