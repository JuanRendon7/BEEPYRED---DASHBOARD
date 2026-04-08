import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInvoices } from '@/hooks/useInvoices'
import type { BffInvoice } from '@/types/api'

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

  const title = type === 'revenue'
    ? `Ingresos del mes (${baseInvoices.length})`
    : type === 'pending'
    ? `Pendiente de recaudo (${baseInvoices.length})`
    : ''

  const total = baseInvoices.reduce(
    (sum, inv) => sum + (type === 'revenue' ? inv.total_cobrado : inv.saldo),
    0
  )

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
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
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            {!isLoading && !isError && baseInvoices.length > 0 && (
              <p className="text-xs text-text-muted mt-0.5">Total: {formatCOP(total)}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-page border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="p-5">
              <p className="text-sm text-error">Error al cargar facturas</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener la lista de facturas'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay facturas en esta categoría.</p>
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    {type === 'revenue' ? 'Fecha pago' : 'Atraso'}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    {type === 'revenue' ? 'Cobrado' : 'Saldo'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((inv, idx) => {
                  const days = type === 'pending' ? daysOverdue(inv.fecha_vencimiento) : 0
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-text-primary font-medium">
                        {inv.cliente.nombre}
                      </td>
                      <td className="px-3 py-3 text-text-secondary tabular-nums">
                        {type === 'revenue'
                          ? (inv.fecha_pago ? formatDate(inv.fecha_pago) : '—')
                          : days > 0
                            ? <span className="text-error font-medium">{days}d</span>
                            : <span className="text-yellow-400">Hoy</span>
                        }
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          inv.estado === 'Pagada'             && 'bg-green-500/10 text-green-400',
                          inv.estado === 'Vencida'            && 'bg-red-500/10 text-error',
                          inv.estado === 'Pendiente de Pago'  && 'bg-yellow-500/10 text-yellow-400',
                          inv.estado === 'Pendiente'          && 'bg-yellow-500/10 text-yellow-400',
                        )}>
                          {inv.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-text-primary tabular-nums">
                        {formatCOP(type === 'revenue' ? inv.total_cobrado : inv.saldo)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
