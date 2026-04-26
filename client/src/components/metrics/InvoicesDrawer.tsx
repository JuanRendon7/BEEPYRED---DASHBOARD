import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInvoices } from '@/hooks/useInvoices'
import type { BffInvoice } from '@/types/api'
import { ExportButtons } from '@/components/ui/ExportButtons'
import { exportToExcel, exportToPDF } from '@/lib/export'

interface InvoicesDrawerProps {
  type: 'revenue' | 'pending' | null  // null = cerrado
  onClose: () => void
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function daysOverdue(fechaVencimiento: string): number {
  const diff = new Date().getTime() - new Date(fechaVencimiento).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function getBaseInvoices(invoices: BffInvoice[], type: 'revenue' | 'pending'): BffInvoice[] {
  if (type === 'revenue') {
    const now = new Date()
    return invoices.filter(inv => {
      if (inv.estado !== 'Pagada' || inv.fecha_pago === null) return false
      const d = new Date(inv.fecha_pago)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
  }
  return invoices.filter(inv => inv.estado !== 'Pagada' && inv.estado !== 'Cancelada')
}

export function InvoicesDrawer({ type, onClose }: InvoicesDrawerProps) {
  const isOpen = type !== null
  const { data, isLoading, isError, error } = useInvoices()
  const [search, setSearch] = useState('')

  const baseInvoices: BffInvoice[] = isOpen && data && type
    ? getBaseInvoices(data.invoices, type)
    : []

  const filteredInvoices = search.trim()
    ? baseInvoices.filter(inv =>
        inv.cliente.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : baseInvoices

  const titleBase = type === 'revenue'
    ? 'Ingresos del mes'
    : type === 'pending'
    ? 'Pendiente de recaudo'
    : ''

  const total = baseInvoices.reduce(
    (sum, inv) => sum + inv.total_cobrado,
    0
  )

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
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
            <span className="ml-2 inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
              {baseInvoices.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons
              disabled={baseInvoices.length === 0}
              onExcel={() => exportToExcel(
                baseInvoices.map(inv => ({ Cliente: inv.cliente.nombre, Estado: inv.estado, 'Fecha venc.': inv.fecha_vencimiento, 'Fecha pago': inv.fecha_pago ?? '—', Total: inv.total_cobrado })),
                `facturas_${type}_beepyred`, 'Facturas'
              )}
              onPDF={() => exportToPDF(titleBase, [
                { header: 'Cliente', dataKey: 'Cliente' },
                { header: 'Estado', dataKey: 'Estado' },
                { header: 'Vencimiento', dataKey: 'Venc' },
                { header: 'Total', dataKey: 'Total' },
              ], baseInvoices.map(inv => ({ Cliente: inv.cliente.nombre, Estado: inv.estado, Venc: inv.fecha_vencimiento, Total: `$${inv.total_cobrado.toLocaleString('es-CO')}` })),
              `facturas_${type}_beepyred`)}
            />
            <button onClick={onClose} className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200" aria-label="Cerrar panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-page border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar facturas</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener la lista de facturas'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay facturas en esta categoría.</p>
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {type === 'revenue' ? 'Fecha pago' : 'Atraso'}
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {type === 'revenue' ? 'Cobrado' : 'Saldo'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredInvoices.map((inv, idx) => {
                  const days = type === 'pending' ? daysOverdue(inv.fecha_vencimiento) : 0
                  return (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors duration-150">
                      <td className="px-6 py-3.5 text-sm text-text-primary font-medium">
                        {inv.cliente.nombre}
                      </td>
                      <td className="px-3 py-3.5 text-sm text-text-secondary tabular-nums">
                        {type === 'revenue'
                          ? (inv.fecha_pago ? formatDate(inv.fecha_pago) : '—')
                          : days > 0
                            ? <span className="text-error font-medium">{days}d</span>
                            : <span className="text-amber-400">Hoy</span>
                        }
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          inv.estado === 'Pagada'             && 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
                          inv.estado === 'Vencida'            && 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
                          inv.estado === 'Pendiente de Pago'  && 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
                          inv.estado === 'Pendiente'          && 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
                        )}>
                          {inv.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm text-text-primary tabular-nums font-medium">
                        {formatCOP(inv.total_cobrado)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — total */}
        {!isLoading && !isError && baseInvoices.length > 0 && (
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Total
            </span>
            <span className="text-sm font-bold text-brand tabular-nums">
              {formatCOP(total)}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
