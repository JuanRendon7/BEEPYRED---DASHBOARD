export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-border" />
          <div className="h-9 w-40 rounded bg-border" />
          <div className="h-3 w-24 rounded bg-border" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-border" />
      </div>
    </div>
  )
}
