import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, RotateCw } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProductFilters, type FilterState } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSkeletonGrid } from "@/components/products/ProductSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";

export function ProductSection() {
  const { data, isLoading, isError, refetch, isFetching } = useCatalog();
  const { reconcile } = useCart();
  const [filters, setFilters] = useState<FilterState>({ query: "", category: "Todo" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (data) reconcile(data);
  }, [data, reconcile]);

  const products = useMemo(() => {
    if (!data) return [];
    const q = filters.query.trim().toLowerCase();
    return data.filter((p) => {
      const catOk = filters.category === "Todo" || p.category === filters.category;
      const qOk = !q || p.name.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [data, filters]);
  const categories = useMemo(
    () =>
      Array.from(new Set((data ?? []).map((product) => product.category))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [data],
  );
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const visibleProducts = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [products, page],
  );

  useEffect(() => {
    setPage(1);
  }, [filters.query, filters.category]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section id="coleccion" className="scroll-mt-24 bg-[color:var(--paper)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Colección"
            title={
              <>
                Encuentra tu <em className="italic">próximo favorito</em>.
              </>
            }
            description="El catálogo se sincroniza con las existencias de la tienda."
          />
          <div className="w-full max-w-xl md:max-w-md">
            <ProductFilters value={filters} onChange={setFilters} categories={categories} />
          </div>
        </div>

        {isLoading ? (
          <ProductSkeletonGrid count={10} />
        ) : isError ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" strokeWidth={1.4} />}
            title="No pudimos cargar el catálogo"
            description="Ocurrió un problema al comunicarnos con la tienda. Puedes intentarlo de nuevo."
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--forest)] px-5 py-2.5 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
              >
                <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Intentar nuevamente
              </button>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" strokeWidth={1.4} />}
            title="No encontramos productos"
            description="Prueba con otra búsqueda o cambia el filtro de categoría."
          />
        ) : (
          <div className="space-y-10">
            <ProductGrid
              key={`${page}-${filters.query}-${filters.category}`}
              products={visibleProducts}
            />
            <nav
              className="flex flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] pt-6 sm:flex-row"
              aria-label="Paginación del catálogo"
            >
              <p className="text-xs text-[color:var(--ink-muted)]">
                Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, products.length)}{" "}
                de {products.length} productos
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[color:var(--border)] px-4 text-sm text-[color:var(--ink)] transition hover:border-[color:var(--forest)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="min-w-20 text-center text-xs font-semibold text-[color:var(--forest)]">
                  {page} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[color:var(--border)] px-4 text-sm text-[color:var(--ink)] transition hover:border-[color:var(--forest)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
