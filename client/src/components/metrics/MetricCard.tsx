import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconClassName?: string
  className?: string
  isLoading?: boolean
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
  isLoading = false,
  onClick,
}: MetricCardProps) {
  const isClickable = onClick !== undefined

  return (
    <div
      className={cn(
        'card-shimmer group relative overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5',
        'transition-all duration-300',
        isClickable && [
          'cursor-pointer select-none',
          'hover:border-brand/40 hover:-translate-y-1',
          'hover:shadow-[0_8px_32px_rgba(245,168,0,0.12),0_2px_8px_rgba(0,0,0,0.4)]',
          'active:translate-y-0 active:shadow-lg',
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {/* Animated top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Static shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Corner glow — top right */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden" />

      {/* Header row: title + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand leading-none pt-0.5 transition-colors duration-200">
          {title}
        </p>
        <div className={cn(
          'flex-shrink-0 rounded-xl p-2.5',
          'bg-white/5 ring-1 ring-inset ring-white/8',
          'transition-all duration-300',
          isClickable && 'group-hover:bg-brand/10 group-hover:ring-brand/20 group-hover:scale-110',
          iconClassName
        )}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Value */}
      {isLoading ? (
        <div className="mt-4 h-8 w-32 rounded-lg bg-white/[0.06] animate-pulse" />
      ) : (
        <p className="mt-4 text-2xl font-bold leading-none tracking-tight text-text-primary tabular-nums transition-colors duration-200 group-hover:text-white">
          {value}
        </p>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-2 text-xs leading-relaxed text-text-muted/80">
          {subtitle}
        </p>
      )}
    </div>
  )
}
