export function InvoiceListSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="border-b border-border px-4 py-3 bg-border/20">
        <div className="h-4 w-48 rounded bg-border" />
      </div>

      <div className="divide-y divide-border animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-4 flex-1 rounded bg-border" />
            <div className="h-4 w-16 rounded bg-border" />
            <div className="h-4 w-24 rounded bg-border" />
            <div className="h-6 w-20 rounded-full bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
