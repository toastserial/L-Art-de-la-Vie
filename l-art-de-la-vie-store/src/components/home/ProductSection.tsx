import { useEffect, useMemo, useState } from "react";
import { PackageSearch, RotateCw } from "lucide-react";
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
            <ProductFilters value={filters} onChange={setFilters} />
          </div>
        </div>

        {isLoading ? (
          <ProductSkeletonGrid />
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
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}
