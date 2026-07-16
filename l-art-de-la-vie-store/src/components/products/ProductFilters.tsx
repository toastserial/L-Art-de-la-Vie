import { Search } from "lucide-react";
import type { Category } from "@/types/product";

export interface FilterState {
  query: string;
  category: Category | "Todo";
}

const CATS: (Category | "Todo")[] = ["Todo", "Decoración", "Perfumes", "Carteras", "Varios"];

export function ProductFilters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="relative block">
        <span className="sr-only">Buscar producto</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-muted)]" />
        <input
          type="search"
          placeholder="Buscar por nombre…"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          className="w-full rounded-full border border-[color:var(--border)] bg-[color:var(--paper)] py-3 pl-11 pr-4 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:border-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
        />
      </label>
      <div
        role="tablist"
        aria-label="Filtrar por categoría"
        className="hide-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
      >
        {CATS.map((c) => {
          const active = value.category === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ ...value, category: c })}
              className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition min-h-11 ${
                active
                  ? "border-[color:var(--forest)] bg-[color:var(--forest)] text-[color:var(--cream)]"
                  : "border-[color:var(--border)] bg-transparent text-[color:var(--ink)] hover:border-[color:var(--forest)]"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
