import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconClassName?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-6',
        'transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex-shrink-0 rounded-lg p-3',
            iconClassName
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
