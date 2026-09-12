export default function MyOrdersLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8" aria-busy="true" aria-label="Cargando pedidos">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-bg-card" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-56 rounded bg-bg-dark" />
              <div className="h-6 w-28 rounded-full bg-bg-dark" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-3 w-3/4 rounded bg-bg-dark" />
              <div className="h-3 w-2/3 rounded bg-bg-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
