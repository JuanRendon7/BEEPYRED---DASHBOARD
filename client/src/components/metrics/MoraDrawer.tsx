import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMora } from '@/hooks/useMora'

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n)
}

function diasColor(dias: number): string {
  if (dias > 90) return 'text-red-400'
  if (dias >= 30) return 'text-orange-400'
  return 'text-yellow-400'
}

function diasBadgeClass(dias: number): string {
  if (dias > 90) return 'bg-red-400/10 text-red-400'
  if (dias >= 30) return 'bg-orange-400/10 text-orange-400'
  return 'bg-yellow-400/10 text-yellow-400'
}

interface MoraDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MoraDrawer({ isOpen, onClose }: MoraDrawerProps) {
  const { data, isLoading, isError, error } = useMora()

  const clientes = isOpen && data ? data.clientesEnMora : []
  const title = data
    ? `Clientes en mora (${data.totalClientesEnMora})`
    : 'Clientes en mora'

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

        {/* Leyenda de colores */}
        {!isLoading && !isError && clientes.length > 0 && (
          <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-red-400/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Nivel de atraso
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                <span className="text-text-muted">+90 días</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-text-muted">30–90 días</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-text-muted">&lt;30 días</span>
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="p-5">
              <p className="text-sm text-error">Error al cargar clientes en mora</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener la lista de clientes en mora'}
              </p>
            </div>
          )}

          {!isLoading && !isError && clientes.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay clientes en mora.</p>
            </div>
          )}

          {!isLoading && !isError && clientes.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cliente</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Días atraso</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Facturas</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Monto mora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.nombre}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-primary font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', diasColor(cliente.diasMaxAtraso).replace('text-', 'bg-'))} />
                        <span className="truncate max-w-[170px]">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={cn('inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium', diasBadgeClass(cliente.diasMaxAtraso))}>
                        {formatNumber(cliente.diasMaxAtraso)}d
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums">
                      {cliente.facturaCount}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary tabular-nums">
                      {formatCOP(cliente.totalMora)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — totales */}
        {!isLoading && !isError && data && data.totalClientesEnMora > 0 && (
          <div className="flex-shrink-0 border-t border-border px-5 py-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Total clientes en mora
              </span>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {formatNumber(data.totalClientesEnMora)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Monto total en mora
              </span>
              <span className="text-sm font-semibold text-red-400 tabular-nums">
                {formatCOP(data.totalMontoMora)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
