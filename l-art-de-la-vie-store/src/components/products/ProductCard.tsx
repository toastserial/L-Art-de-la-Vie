import { motion, useReducedMotion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import { formatL } from "@/lib/currency";
import { useCart } from "@/hooks/useCart";
import { ProductQuickView } from "./ProductQuickView";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, open } = useCart();
  const [previewOpen, setPreviewOpen] = useState(false);
  const soldOut = product.stock <= 0;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28, delay: Math.min(index, 3) * 0.035 }}
      className="group flex flex-col"
    >
      <button type="button" onClick={() => setPreviewOpen(true)} className="relative overflow-hidden rounded-lg bg-[color:var(--cream)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]" aria-label={`Ver detalles de ${product.name}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center bg-[linear-gradient(145deg,var(--cream),#d8e0d7)] text-center">
            <span className="px-6 font-serif text-3xl italic text-[color:var(--forest)]/35">
              L’Art de la Vie
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <span className="rounded-full bg-[color:var(--paper)]/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--forest)]">
            {product.category}
          </span>
          {product.discountPercent > 0 ? <span className="w-fit rounded-full bg-[color:var(--forest)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--cream)]">Oferta · -{product.discountPercent}%</span> : null}
        </div>
        {soldOut ? (
          <div className="absolute inset-x-3 bottom-3 rounded-md bg-[color:var(--ink)]/80 px-3 py-1.5 text-center text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--cream)]">
            Agotado
          </div>
        ) : product.stock <= 3 ? (
          <div className="absolute right-3 top-3 rounded-full bg-[color:var(--gold)]/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--forest)]">
            Últimas {product.stock}
          </div>
        ) : null}
        <span className="absolute bottom-3 left-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-[color:var(--paper)]/95 text-[color:var(--forest)] opacity-0 shadow-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Eye className="h-4 w-4" /></span>
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg text-[color:var(--ink)]">{product.name}</h3>
          {soldOut ? <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Sin existencias</p> : <div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="text-base font-semibold text-[color:var(--forest)]">{formatL(product.price)}</span>{product.originalPrice ? <span className="text-xs text-[color:var(--ink-muted)] line-through">{formatL(product.originalPrice)}</span> : null}</div>}
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add(product, 1);
            open();
          }}
          aria-label={soldOut ? `${product.name} agotado` : `Agregar ${product.name} a la bolsa`}
          className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[color:var(--forest)] text-[color:var(--forest)] transition hover:bg-[color:var(--forest)] hover:text-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:border-[color:var(--border)] disabled:bg-transparent disabled:text-[color:var(--ink-muted)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <ProductQuickView product={previewOpen ? product : null} onClose={() => setPreviewOpen(false)} onAdd={(item, quantity) => { add(item, quantity); setPreviewOpen(false); open(); }} />
    </motion.article>
  );
}
