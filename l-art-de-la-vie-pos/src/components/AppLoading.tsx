import { Skeleton } from "@/components/ui/skeleton";

export function SessionLoading() {
  return <main className="grid min-h-screen place-items-center bg-[#f6f4ed] p-6" aria-busy="true" aria-label="Verificando sesión">
    <div className="flex flex-col items-center">
      <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-primary shadow-xl">
        <img src="/lartdela.png" alt="L'Art de la Vie" className="h-32 w-32 max-w-none object-contain" />
        <span className="absolute inset-0 rounded-full border border-accent/30" />
      </div>
      <p className="mt-6 font-display text-2xl font-semibold text-primary">L'Art de la Vie</p>
      <div className="mt-5 flex gap-1.5"><span className="loading-dot" /><span className="loading-dot [animation-delay:120ms]" /><span className="loading-dot [animation-delay:240ms]" /></div>
      <p className="mt-3 text-xs text-muted-foreground">Preparando tu espacio de trabajo</p>
    </div>
  </main>;
}

export function StoreLoadingSkeleton() {
  return <main className="min-h-screen bg-background" aria-busy="true" aria-label="Cargando información de la tienda">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 bg-primary p-6 md:block">
        <Skeleton className="mx-auto h-7 w-36 bg-white/15" />
        <Skeleton className="mx-auto mt-3 h-3 w-24 bg-white/10" />
        <div className="mt-12 space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-11 w-full rounded-xl bg-white/10" />)}</div>
      </aside>
      <section className="min-w-0 flex-1">
        <div className="flex h-14 items-center border-b bg-card px-5"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="ml-auto h-7 w-32 rounded-full" /></div>
        <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-7">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="rounded-2xl border bg-card p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-5 h-8 w-32" /><Skeleton className="mt-3 h-3 w-20" /></div>)}</div>
          <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border bg-card p-5"><Skeleton className="h-5 w-36" /><Skeleton className="mt-6 h-56 w-full rounded-xl" /></div><div className="rounded-2xl border bg-card p-5"><Skeleton className="h-5 w-44" />{Array.from({ length: 4 }).map((_, index) => <div key={index} className="mt-5 flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-2 h-3 w-1/3" /></div></div>)}</div></div>
        </div>
      </section>
    </div>
  </main>;
}
