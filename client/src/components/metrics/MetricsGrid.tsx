import { Users, Wifi, DollarSign, TrendingUp } from 'lucide-react'
import { useMetrics } from '@/hooks/useMetrics'
import { MetricCard } from './MetricCard'
import { MetricCardSkeleton } from './MetricCardSkeleton'
import type { MetricsData } from '@/types/api'

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

interface MetricsGridProps {
  _data?: MetricsData
}

export function MetricsGrid({ _data }: MetricsGridProps = {}) {
  const { data, isLoading, isError, error } = useMetrics()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 px-6 py-4">
        <p className="text-sm font-medium text-error">
          Error al cargar métricas
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {error?.message ?? 'No se pudieron obtener los datos de Wisphub'}
        </p>
      </div>
    )
  }

  const metrics = _data ?? data

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Clientes activos"
        value={formatNumber(metrics.activeClients)}
        subtitle="Estado Activo en Wisphub"
        icon={Users}
        iconClassName="text-text-secondary"
      />
      <MetricCard
        title="Conectados ahora"
        value="N/D"
        subtitle="No disponible en Wisphub API"
        icon={Wifi}
        iconClassName="text-text-muted"
      />
      <MetricCard
        title="Deuda pendiente"
        value={formatCOP(metrics.pendingDebt)}
        subtitle="Saldo positivo total"
        icon={DollarSign}
        iconClassName="text-brand"
      />
      <MetricCard
        title="Ingresos del mes"
        value={formatCOP(metrics.monthlyRevenue)}
        subtitle="Facturas pagadas este mes"
        icon={TrendingUp}
        iconClassName="text-brand"
      />
    </div>
  )
}
