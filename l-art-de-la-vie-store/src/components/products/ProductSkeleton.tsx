export function ProductSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="aspect-[4/5] w-full rounded-lg bg-[color:var(--muted)]" />
      <div className="mt-4 h-4 w-2/3 rounded bg-[color:var(--muted)]" />
      <div className="mt-2 h-3 w-1/3 rounded bg-[color:var(--muted)]" />
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
