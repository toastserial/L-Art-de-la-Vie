import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCatalog } from "@/hooks/useCatalog";
import { formatL } from "@/lib/currency";
import { CartItem } from "./CartItem";
import { CheckoutDialog } from "./CheckoutDialog";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, count, add, lastAdded } = useCart();
  const { data: catalog } = useCatalog();
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

  const recommendations = useMemo(() => {
    const available = (catalog ?? []).filter(
      (product) => product.stock > 0 && !items.some((item) => item.id === product.id),
    );
    if (!lastAdded) return available.slice(0, 4);

    const related = available.filter((product) => product.category === lastAdded.category);
    const rest = available.filter((product) => product.category !== lastAdded.category);
    return [...related, ...rest].slice(0, 4);
  }, [catalog, items, lastAdded]);
  const addedItemStillInBag = Boolean(lastAdded && items.some((item) => item.id === lastAdded.id));

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

                  <div className="flex-1 overflow-y-auto px-6 pb-5">
                    {lastAdded && addedItemStillInBag ? (
                      <section className="mt-5 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-4" aria-label="Producto agregado">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--forest)]">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--forest)] text-white">
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                          Agregado a tu bolsa
                        </div>
                        <div className="mt-3 flex gap-3">
                          <img src={lastAdded.image} alt="" className="h-16 w-16 rounded-xl object-cover bg-white" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-[color:var(--ink)]">{lastAdded.name}</p>
                            <p className="mt-1 text-sm font-semibold text-[color:var(--forest)]">{formatL(lastAdded.price)}</p>
                          </div>
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-xs text-[color:var(--ink-muted)]">
                          <Truck className="h-4 w-4 text-[color:var(--gold)]" /> Enviamos a Siguatepeque y a todo Honduras.
                        </p>
                      </section>
                    ) : null}

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
                      <ul className="divide-y divide-[color:var(--border)] mt-3">
                        {items.map((it) => (
                          <CartItem key={it.id} item={it} />
                        ))}
                      </ul>
                    )}

                    {recommendations.length > 0 ? (
                      <section className="mt-6 border-t border-[color:var(--border)] pt-5">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold)]">Para complementar</p>
                            <h3 className="mt-1 font-serif text-xl text-[color:var(--ink)]">También te puede gustar</h3>
                          </div>
                          <span className="text-xs text-[color:var(--ink-muted)]">Elegidos para ti</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {recommendations.map((product) => (
                            <article key={product.id} className="group rounded-2xl border border-[color:var(--border)] bg-white p-2.5 shadow-sm">
                              <img src={product.image} alt="" className="aspect-square w-full rounded-xl object-cover bg-[color:var(--cream)]" loading="lazy" />
                              <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-[color:var(--ink)]">{product.name}</p>
                              <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-sm font-semibold text-[color:var(--forest)]">{formatL(product.price)}</span>
                                {product.originalPrice ? <span className="text-[10px] text-[color:var(--ink-muted)] line-through">{formatL(product.originalPrice)}</span> : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => add(product, 1)}
                                className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-full border border-[color:var(--forest)] px-2 text-xs font-medium text-[color:var(--forest)] transition hover:bg-[color:var(--forest)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                              >
                                <Plus className="h-3.5 w-3.5" /> Agregar
                              </button>
                            </article>
                          ))}
                        </div>
                      </section>
                    ) : null}
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
