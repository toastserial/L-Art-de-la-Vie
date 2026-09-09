export function ProductSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <div className="skeleton-surface aspect-[4/5] w-full rounded-lg" />
      <div className="skeleton-surface mt-4 h-4 w-2/3 rounded" />
      <div className="skeleton-surface mt-2 h-3 w-1/3 rounded" />
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Cargando productos" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
