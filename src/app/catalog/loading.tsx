export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="Cargando catálogo">
      <div className="mb-8 animate-pulse">
        <div className="h-9 w-64 rounded-lg bg-bg-card" />
        <div className="mt-3 h-4 w-40 rounded bg-bg-card" />
      </div>

      <div className="mb-6 flex animate-pulse flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 rounded-lg bg-bg-card" />
        <div className="h-11 w-full rounded-lg bg-bg-card sm:w-48" />
        <div className="h-11 w-full rounded-lg bg-bg-card sm:w-56" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-lg border border-border bg-bg-card"
          >
            <div className="aspect-square w-full bg-bg-dark" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-full rounded bg-bg-dark" />
              <div className="h-4 w-2/3 rounded bg-bg-dark" />
              <div className="mt-1 h-6 w-24 rounded bg-bg-dark" />
              <div className="mt-2 h-9 w-full rounded-md bg-bg-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
