import { cn } from '@/lib/utils'
import type { BffInvoice } from '@/types/api'

interface InvoiceRowProps {
  invoice: BffInvoice
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calcularDiasAtraso(fechaVencimiento: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const partes = fechaVencimiento.split('-').map(Number)
  const vencimiento = new Date(partes[0], partes[1] - 1, partes[2])

  if (vencimiento >= hoy) return 0

  const diffMs = hoy.getTime() - vencimiento.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const diasAtraso = calcularDiasAtraso(invoice.fecha_vencimiento)
  const montoMostrar = invoice.saldo > 0 ? invoice.saldo : invoice.total

  const badgeClassName = cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    diasAtraso === 0 && 'bg-border text-text-secondary',
    diasAtraso > 0 && diasAtraso <= 30 && 'bg-error/20 text-error',
    diasAtraso > 30 && diasAtraso <= 60 && 'bg-error/30 text-error',
    diasAtraso > 60 && 'bg-error/40 text-error font-bold',
  )

  return (
    <tr className="border-b border-border last:border-0 hover:bg-border/20 transition-colors">
      <td className="px-4 py-3 text-sm text-text-primary">
        {invoice.cliente.nombre}
      </td>
      <td className="px-4 py-3 text-sm text-text-muted font-mono">
        #{invoice.id_factura}
      </td>
      <td className="px-4 py-3 text-sm text-text-primary font-medium text-right">
        {formatCOP(montoMostrar)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={badgeClassName}>
          {diasAtraso === 0
            ? 'Pendiente'
            : `${diasAtraso} día${diasAtraso !== 1 ? 's' : ''}`}
        </span>
      </td>
    </tr>
  )
}
