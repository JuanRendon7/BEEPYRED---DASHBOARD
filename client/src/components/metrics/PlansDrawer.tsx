import { X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlans } from '@/hooks/usePlans'
import { ExportButtons } from '@/components/ui/ExportButtons'
import { exportToExcel, exportToPDF } from '@/lib/export'

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
  const titleBase = 'Planes de internet'

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
        aria-label={titleBase}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">{titleBase}</h2>
            {data && (
              <span className="ml-2 inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
                {data.totalPlanes}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons
              disabled={!data || plans.length === 0}
              onExcel={() => exportToExcel(
                plans.map(p => ({ Plan: p.nombre, Clientes: p.clientCount, 'Recaudo/mes': p.recaudo, 'Precio promedio': p.avgPrecio })),
                'planes_beepyred', 'Planes'
              )}
              onPDF={() => exportToPDF('Distribución de planes', [
                { header: 'Plan', dataKey: 'Plan' },
                { header: 'Clientes', dataKey: 'Clientes' },
                { header: 'Recaudo/mes', dataKey: 'Recaudo/mes' },
                { header: 'Precio prom.', dataKey: 'Precio promedio' },
              ], plans.map(p => ({ Plan: p.nombre, Clientes: p.clientCount, 'Recaudo/mes': `$${p.recaudo.toLocaleString('es-CO')}`, 'Precio promedio': `$${p.avgPrecio.toLocaleString('es-CO')}` })),
              'planes_beepyred')}
            />
            <button onClick={onClose} className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200" aria-label="Cerrar panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Plan más popular — featured banner */}
        {!isLoading && !isError && data && data.planMasPopular && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-brand/5 to-transparent">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Plan más popular
              </span>
            </div>
            <p className="text-base font-bold text-text-primary mt-1">{data.planMasPopular}</p>
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
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar planes</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener la lista de planes'}
              </p>
            </div>
          )}

          {!isLoading && !isError && plans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay planes disponibles.</p>
            </div>
          )}

          {!isLoading && !isError && plans.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Plan</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Clientes</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Recaudo/mes</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Precio prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {plans.map((plan, idx) => (
                  <tr
                    key={plan.nombre}
                    className={cn(
                      'hover:bg-white/[0.03] transition-colors duration-150',
                      idx === 0 && 'bg-brand/5'
                    )}
                  >
                    <td className="px-6 py-3.5 text-sm text-text-primary font-medium">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && <Star className="h-3 w-3 text-brand flex-shrink-0" />}
                        <span className={idx === 0 ? 'truncate max-w-[160px]' : 'truncate max-w-[180px]'}>
                          {plan.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-secondary tabular-nums font-medium">
                      {formatNumber(plan.clientCount)}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-secondary tabular-nums font-medium">
                      {formatCOP(plan.recaudo)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-text-muted tabular-nums font-medium">
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
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Total clientes activos
              </span>
              <span className="text-sm font-bold text-text-primary tabular-nums">
                {formatNumber(data.totalClientes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Recaudo potencial mensual
              </span>
              <span className="text-sm font-bold text-brand tabular-nums">
                {formatCOP(data.totalRecaudo)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
