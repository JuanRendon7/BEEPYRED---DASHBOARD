import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceRow } from './InvoiceRow'
import { InvoiceListSkeleton } from './InvoiceListSkeleton'
import type { BffInvoice } from '@/types/api'

function isPendingInvoice(invoice: BffInvoice): boolean {
  return invoice.saldo > 0
}

export function InvoiceList() {
  const { data, isLoading, isError, error } = useInvoices()

  if (isLoading) {
    return <InvoiceListSkeleton />
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 px-6 py-4">
        <p className="text-sm font-medium text-error">
          Error al cargar facturas
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {error?.message ?? 'No se pudieron obtener las facturas de Wisphub'}
        </p>
      </div>
    )
  }

  if (!data) return null

  const pendingInvoices = data.invoices.filter(isPendingInvoice)

  if (pendingInvoices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <p className="text-text-secondary font-medium">
          Sin facturas pendientes
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Todos los clientes están al día
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="border-b border-border px-4 py-3 bg-border/20 flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">
          Facturas pendientes
        </p>
        <span className="text-xs text-text-muted">
          {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Cliente
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Factura
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                Monto
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                Atraso
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingInvoices.map((invoice) => (
              <InvoiceRow key={invoice.id_factura} invoice={invoice} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
