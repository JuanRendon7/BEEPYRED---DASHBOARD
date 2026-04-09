import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconClassName?: string
  className?: string
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
  onClick,
}: MetricCardProps) {
  const isClickable = onClick !== undefined

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface p-5',
        'transition-all duration-200',
        isClickable && [
          'cursor-pointer select-none',
          'hover:border-zinc-600 hover:-translate-y-px',
          'hover:shadow-2xl hover:shadow-black/50',
          'active:translate-y-0 active:shadow-lg',
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {/* Shimmer top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Header row: title + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted leading-none pt-0.5">
          {title}
        </p>
        <div className={cn(
          'flex-shrink-0 rounded-xl p-2.5',
          'bg-white/5 ring-1 ring-inset ring-white/8',
          'transition-colors duration-200',
          isClickable && 'group-hover:bg-white/8',
          iconClassName
        )}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Value */}
      <p className="mt-4 text-2xl font-bold leading-none tracking-tight text-text-primary tabular-nums">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-2 text-xs leading-relaxed text-text-muted/80">
          {subtitle}
        </p>
      )}
    </div>
  )
}
