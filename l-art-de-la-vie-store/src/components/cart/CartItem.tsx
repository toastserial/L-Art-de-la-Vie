import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemT } from "@/types/product";
import { formatL } from "@/lib/currency";
import { useCart } from "@/hooks/useCart";

export function CartItem({ item }: { item: CartItemT }) {
  const { setQty, remove } = useCart();
  return (
    <li className="flex gap-4 py-5">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-[color:var(--cream)]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-serif text-xl italic text-[color:var(--forest)]/40">
            L
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--forest-2)]">
              {item.category}
            </div>
            <h3 className="mt-0.5 truncate font-serif text-base text-[color:var(--ink)]">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">{formatL(item.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            aria-label={`Quitar ${item.name}`}
            className="inline-grid h-9 w-9 place-items-center rounded-full text-[color:var(--ink-muted)] hover:bg-[color:var(--cream)] hover:text-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="inline-flex items-center rounded-full border border-[color:var(--border)]">
            <button
              type="button"
              onClick={() => setQty(item.id, item.quantity - 1)}
              aria-label="Disminuir cantidad"
              className="grid h-9 w-9 place-items-center text-[color:var(--forest)] hover:bg-[color:var(--cream)] rounded-l-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span aria-live="polite" className="min-w-9 px-1 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQty(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label="Aumentar cantidad"
              className="grid h-9 w-9 place-items-center text-[color:var(--forest)] hover:bg-[color:var(--cream)] rounded-r-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] disabled:cursor-not-allowed disabled:text-[color:var(--ink-muted)]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-sm font-medium text-[color:var(--ink)]">
            {formatL(item.price * item.quantity)}
          </div>
        </div>
      </div>
    </li>
  );
}
