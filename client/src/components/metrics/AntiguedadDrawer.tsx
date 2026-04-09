import { X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAntiguedad } from '@/hooks/useAntiguedad'
import type { AntiguedadDistribution } from '@/types/api'

function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n)
}

interface BucketRowProps {
  label: string
  count: number
  total: number
  colorClass: string
}

function BucketRow({ label, count, total, colorClass }: BucketRowProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="text-text-muted tabular-nums">
          {formatNumber(count)} clientes &middot; {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface AntiguedadDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AntiguedadDrawer({ isOpen, onClose }: AntiguedadDrawerProps) {
  const { data, isLoading, isError, error } = useAntiguedad()

  const title = 'Antigüedad promedio de clientes'

  const buckets: Array<{ key: keyof AntiguedadDistribution; label: string; colorClass: string }> = [
    { key: 'menosDe6Meses', label: 'Menos de 6 meses', colorClass: 'bg-yellow-400' },
    { key: 'de6A12Meses',   label: '6 a 12 meses',     colorClass: 'bg-brand' },
    { key: 'de1A2Anos',     label: '1 a 2 años',        colorClass: 'bg-blue-400' },
    { key: 'masDe2Anos',    label: 'Más de 2 años',     colorClass: 'bg-green-400' },
  ]

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-[600px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Promedio destacado */}
        {!isLoading && !isError && data && (
          <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-brand/5">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand flex-shrink-0" />
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Antigüedad promedio
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-text-primary">{data.avgLabel}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Sobre {formatNumber(data.totalClientes)} clientes activos
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
                  <div className="h-2 rounded-full bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="p-5">
              <p className="text-sm text-error">Error al cargar antigüedad</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener los datos de antigüedad'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && data.totalClientes === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay datos de antigüedad disponibles.</p>
            </div>
          )}

          {!isLoading && !isError && data && data.totalClientes > 0 && (
            <div className="p-5 space-y-5">
              {buckets.map(({ key, label, colorClass }) => (
                <BucketRow
                  key={key}
                  label={label}
                  count={data.distribution[key]}
                  total={data.totalClientes}
                  colorClass={colorClass}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !isError && data && data.totalClientes > 0 && (
          <div className="flex-shrink-0 border-t border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Total clientes activos
              </span>
              <span className="text-sm font-semibold text-brand tabular-nums">
                {formatNumber(data.totalClientes)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
