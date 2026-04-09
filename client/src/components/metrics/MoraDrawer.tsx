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
  return 'text-amber-400'
}

function diasBadgeClass(dias: number): string {
  if (dias > 90) return 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
  if (dias >= 30) return 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20'
  return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
}

interface MoraDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MoraDrawer({ isOpen, onClose }: MoraDrawerProps) {
  const { data, isLoading, isError, error } = useMora()

  const clientes = isOpen && data ? data.clientesEnMora : []
  const title = 'Clientes en mora'

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-[520px] max-w-[95vw]',
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
            {data && (
              <span className="ml-2 inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
                {data.totalClientesEnMora}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Leyenda de colores */}
        {!isLoading && !isError && clientes.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-text-muted">&lt;30 días</span>
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar clientes en mora</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener la lista de clientes en mora'}
              </p>
            </div>
          )}

          {!isLoading && !isError && clientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay clientes en mora.</p>
            </div>
          )}

          {!isLoading && !isError && clientes.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Cliente</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Días atraso</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Facturas</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Monto mora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.nombre}
                    className="hover:bg-white/[0.03] transition-colors duration-150"
                  >
                    <td className="px-6 py-3.5 text-sm text-text-primary font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', diasColor(cliente.diasMaxAtraso).replace('text-', 'bg-'))} />
                        <span className="truncate max-w-[170px]">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      <span className={cn(
                        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        diasBadgeClass(cliente.diasMaxAtraso)
                      )}>
                        {formatNumber(cliente.diasMaxAtraso)}d
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-secondary tabular-nums font-medium">
                      {cliente.facturaCount}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-text-secondary tabular-nums font-medium">
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
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Total clientes en mora
              </span>
              <span className="text-sm font-bold text-text-primary tabular-nums">
                {formatNumber(data.totalClientesEnMora)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Monto total en mora
              </span>
              <span className="text-sm font-bold text-red-400 tabular-nums">
                {formatCOP(data.totalMontoMora)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
