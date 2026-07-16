import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { formatL } from "@/lib/currency";
import { useCart } from "@/hooks/useCart";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, open } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
      className="group flex flex-col"
    >
      <div className="relative overflow-hidden rounded-lg bg-[color:var(--cream)]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg text-[color:var(--ink)]">{product.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
            {soldOut ? "Sin existencias" : formatL(product.price)}
          </p>
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
    </motion.article>
  );
}
