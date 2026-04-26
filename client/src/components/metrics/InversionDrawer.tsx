import { X, Briefcase, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInversion } from '@/hooks/useInversion'
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

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'ahora mismo'
  if (diffMin === 1) return 'hace 1 min'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  return diffH === 1 ? 'hace 1 hora' : `hace ${diffH} horas`
}

interface InversionDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function InversionDrawer({ isOpen, onClose }: InversionDrawerProps) {
  const { data, isLoading, isError, error, isFetching, refetch } = useInversion()

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
          'fixed inset-y-0 right-0 z-40 w-[700px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Inversión accionistas"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">Inversión accionistas</h2>
            {data && (
              <span className="inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
                {data.accionistas.length} accionistas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons
              disabled={!data}
              onExcel={() => {
                if (!data) return
                exportToExcel(
                  data.transacciones.map(tx => ({
                    Fecha: tx.fecha,
                    Concepto: tx.observacion,
                    Nelson: tx.nelson ?? '',
                    Arley: tx.arley ?? '',
                    Jaime: tx.jaime ?? '',
                    'Juan Camilo': tx.juanCamilo ?? '',
                  })),
                  'inversion_accionistas',
                  'Movimientos'
                )
              }}
              onPDF={() => {
                if (!data) return
                exportToPDF(
                  'Inversión accionistas',
                  [
                    { header: 'Fecha', dataKey: 'Fecha' },
                    { header: 'Concepto', dataKey: 'Concepto' },
                    { header: 'Nelson', dataKey: 'Nelson' },
                    { header: 'Arley', dataKey: 'Arley' },
                    { header: 'Jaime', dataKey: 'Jaime' },
                    { header: 'J. Camilo', dataKey: 'JC' },
                  ],
                  data.transacciones.map(tx => ({
                    Fecha: tx.fecha,
                    Concepto: tx.observacion,
                    Nelson: tx.nelson ? formatCOP(tx.nelson) : '—',
                    Arley: tx.arley ? formatCOP(tx.arley) : '—',
                    Jaime: tx.jaime ? formatCOP(tx.jaime) : '—',
                    JC: tx.juanCamilo ? formatCOP(tx.juanCamilo) : '—',
                  })),
                  'inversion_accionistas',
                  'landscape'
                )
              }}
            />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Actualizar desde Google Sheets"
              className="rounded-xl p-2 text-text-muted hover:text-brand hover:bg-brand/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Resumen por accionista */}
        {!isLoading && !isError && data && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-brand/5 to-transparent">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {data.accionistas.map((a) => (
                <div key={a.key} className="rounded-xl bg-white/[0.04] border border-border/60 px-4 py-3">
                  <p className="text-[11px] text-text-muted font-medium mb-1">{a.nombre}</p>
                  <p className="text-sm font-bold text-text-primary tabular-nums">{formatCOP(a.total)}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{a.porcentaje.toFixed(1)}% del total</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Inversión total acumulada
              </span>
              <span className="text-sm font-bold text-brand tabular-nums">
                {formatCOP(data.totalGeneral)}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar datos de inversión</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo leer el Google Sheet'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted w-[90px]">Fecha</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Concepto</th>
                  <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Nelson</th>
                  <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Arley</th>
                  <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Jaime</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">J. Camilo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {/* Saldo inicial */}
                <tr className="bg-white/[0.025]">
                  <td className="px-4 py-3 text-text-muted font-medium">Inicial</td>
                  <td className="px-3 py-3 text-text-muted italic">Saldo inicial</td>
                  {data.accionistas.map((a) => (
                    <td key={a.key} className={cn(
                      'py-3 text-right tabular-nums font-medium',
                      a.key === 'juanCamilo' ? 'px-4' : 'px-2'
                    )}>
                      {a.saldoInicial > 0
                        ? <span className="text-text-secondary">{formatCOP(a.saldoInicial)}</span>
                        : <span className="text-text-muted/30">—</span>}
                    </td>
                  ))}
                </tr>

                {data.transacciones.map((tx, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors duration-150">
                    <td className="px-4 py-3 text-text-muted tabular-nums whitespace-nowrap">{tx.fecha}</td>
                    <td className="px-3 py-3 text-text-secondary max-w-[190px] truncate" title={tx.observacion}>
                      {tx.observacion}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {tx.nelson !== undefined
                        ? <span className="text-text-primary font-medium">{formatCOP(tx.nelson)}</span>
                        : <span className="text-text-muted/30">—</span>}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {tx.arley !== undefined
                        ? <span className="text-text-primary font-medium">{formatCOP(tx.arley)}</span>
                        : <span className="text-text-muted/30">—</span>}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {tx.jaime !== undefined
                        ? <span className="text-text-primary font-medium">{formatCOP(tx.jaime)}</span>
                        : <span className="text-text-muted/30">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {tx.juanCamilo !== undefined
                        ? <span className="text-text-primary font-medium">{formatCOP(tx.juanCamilo)}</span>
                        : <span className="text-text-muted/30">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer totales */}
        {!isLoading && !isError && data && (
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {data.accionistas.map((a) => (
                <div key={a.key} className="text-center">
                  <p className="text-[10px] text-text-muted mb-0.5 truncate">{a.nombre.split(' ')[0]}</p>
                  <p className="text-xs font-bold text-text-primary tabular-nums">{formatCOP(a.total)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Total inversión accionistas
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-muted/60 tabular-nums">
                  Actualizado {timeAgo(data.fetchedAt)}
                </span>
                <span className="text-sm font-bold text-brand tabular-nums">
                  {formatCOP(data.totalGeneral)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
