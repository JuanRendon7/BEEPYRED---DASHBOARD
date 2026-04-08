import { X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlans } from '@/hooks/usePlans'

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

interface PlansDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function PlansDrawer({ isOpen, onClose }: PlansDrawerProps) {
  const { data, isLoading, isError, error } = usePlans()

  const plans = isOpen && data ? data.plans : []
  const title = data ? `Planes de internet (${data.totalPlanes})` : 'Planes de internet'

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

        {/* Plan más popular — destacado */}
        {!isLoading && !isError && data && data.planMasPopular && (
          <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-brand/5">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-brand flex-shrink-0" />
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Plan más popular
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-text-primary">{data.planMasPopular}</p>
            {plans[0] && (
              <p className="text-xs text-text-muted mt-0.5">
                {formatNumber(plans[0].clientCount)} clientes &middot; {formatCOP(plans[0].recaudo)}/mes
              </p>
            )}
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
              <p className="text-sm text-error">Error al cargar planes</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener la lista de planes'}
              </p>
            </div>
          )}

          {!isLoading && !isError && plans.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay planes disponibles.</p>
            </div>
          )}

          {!isLoading && !isError && plans.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Plan</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Clientes</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Recaudo/mes</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Precio prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan, idx) => (
                  <tr
                    key={plan.nombre}
                    className={cn(
                      'hover:bg-white/5 transition-colors',
                      idx === 0 && 'bg-brand/5'
                    )}
                  >
                    <td className="px-5 py-3 text-text-primary font-medium">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && <Star className="h-3 w-3 text-brand flex-shrink-0" />}
                        <span className={idx === 0 ? 'truncate max-w-[160px]' : 'truncate max-w-[180px]'}>
                          {plan.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums">
                      {formatNumber(plan.clientCount)}
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums">
                      {formatCOP(plan.recaudo)}
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted tabular-nums">
                      {formatCOP(plan.avgPrecio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — totales */}
        {!isLoading && !isError && data && data.totalRecaudo > 0 && (
          <div className="flex-shrink-0 border-t border-border px-5 py-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Total clientes activos
              </span>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {formatNumber(data.totalClientes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Recaudo potencial mensual
              </span>
              <span className="text-sm font-semibold text-brand tabular-nums">
                {formatCOP(data.totalRecaudo)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
