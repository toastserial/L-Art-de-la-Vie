import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { formatL } from "@/lib/currency";

interface ProductQuickViewProps {
  product: Product | null;
  onClose(): void;
  onAdd(product: Product, quantity: number): void;
}

export function ProductQuickView({ product, onClose, onAdd }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  useEffect(() => setQuantity(1), [product?.id]);
  useEffect(() => {
    if (!product) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && <motion.div className="fixed inset-0 z-[80] grid place-items-end bg-[color:var(--forest)]/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <motion.section role="dialog" aria-modal="true" aria-label={`Detalles de ${product.name}`} className="grid max-h-[94dvh] w-full max-w-4xl overflow-auto rounded-t-[2rem] bg-[color:var(--paper)] shadow-2xl sm:grid-cols-2 sm:overflow-hidden sm:rounded-[2rem]" initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.24 }}>
          <div className="relative min-h-[44dvh] bg-[color:var(--cream)] sm:min-h-[620px]">
            {product.image ? <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center px-10 text-center font-serif text-4xl italic text-[color:var(--forest)]/35">L’Art de la Vie</div>}
            <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--forest)] backdrop-blur">{product.category}</span>
            <button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[color:var(--forest)] shadow-sm transition hover:scale-105" aria-label="Cerrar"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex flex-col px-7 py-8 sm:px-11 sm:py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--gold)]">Vista de la pieza</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[color:var(--ink)]">{product.name}</h2>
            <div className="mt-5 flex flex-wrap items-baseline gap-3"><p className="text-2xl font-semibold text-[color:var(--forest)]">{formatL(product.price)}</p>{product.originalPrice ? <><span className="text-sm text-[color:var(--ink-muted)] line-through">{formatL(product.originalPrice)}</span><span className="rounded-full bg-[color:var(--forest)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--cream)]">-{product.discountPercent}%</span></> : null}</div>
            <p className="mt-7 text-sm leading-7 text-[color:var(--ink-muted)]">Una pieza seleccionada por L’Art de la Vie para transformar tus espacios y acompañar momentos especiales.</p>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)]/55 p-4">
              <div><p className="text-sm font-semibold text-[color:var(--ink)]">Disponibilidad</p><p className="mt-1 text-xs text-[color:var(--ink-muted)]">{product.stock > 0 ? `${product.stock} unidades` : "Agotado por ahora"}</p></div>
              <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-600" : "bg-red-500"}`} />
            </div>

            <div className="mt-auto pt-9">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">Cantidad</span>
                <div className="flex items-center rounded-full border border-[color:var(--border)]">
                  <button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center" aria-label="Restar"><Minus className="h-4 w-4" /></button>
                  <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))} className="grid h-10 w-10 place-items-center" aria-label="Sumar"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <button type="button" disabled={product.stock <= 0} onClick={() => onAdd(product, quantity)} className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[color:var(--forest)] px-6 text-sm font-semibold text-[color:var(--cream)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45">
                <ShoppingBag className="h-5 w-5" />{product.stock > 0 ? `Agregar · ${formatL(product.price * quantity)}` : "Producto agotado"}
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  );
}
