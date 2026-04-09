export function MetricCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 animate-pulse">
      {/* Shimmer top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Header row: title + icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="h-3 w-28 rounded bg-border" />
        <div className="h-9 w-9 rounded-xl bg-border flex-shrink-0" />
      </div>

      {/* Value */}
      <div className="mt-4 h-7 w-36 rounded bg-border" />

      {/* Subtitle */}
      <div className="mt-2 h-3 w-24 rounded bg-border" />
    </div>
  )
}
