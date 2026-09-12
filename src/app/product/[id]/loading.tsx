export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true" aria-label="Cargando producto">
      <div className="mb-6 h-3 w-72 animate-pulse rounded bg-bg-card" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="animate-pulse">
          <div className="aspect-square w-full rounded-xl border border-border bg-bg-card" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-20 rounded-lg bg-bg-card" />
            ))}
          </div>
        </div>

        <div className="flex animate-pulse flex-col">
          <div className="h-6 w-28 rounded-full bg-bg-card" />
          <div className="mt-4 h-8 w-full rounded bg-bg-card" />
          <div className="mt-2 h-8 w-2/3 rounded bg-bg-card" />
          <div className="mt-6 h-10 w-48 rounded bg-bg-card" />
          <div className="mt-3 h-4 w-40 rounded bg-bg-card" />
          <div className="mt-8 h-12 w-full rounded-lg bg-bg-card" />
          <div className="mt-3 h-12 w-full rounded-lg bg-bg-card" />
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6">
            <div className="h-4 w-full rounded bg-bg-card" />
            <div className="h-4 w-5/6 rounded bg-bg-card" />
            <div className="h-4 w-3/4 rounded bg-bg-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
