import { useState } from 'react'
import { Users, UserX, DollarSign, TrendingUp, UserPlus, BarChart2, Layers } from 'lucide-react'
import { useMetrics } from '@/hooks/useMetrics'
import { MetricCard } from './MetricCard'
import { MetricCardSkeleton } from './MetricCardSkeleton'
import { ClientsDrawer } from './ClientsDrawer'
import { InvoicesDrawer } from './InvoicesDrawer'
import { InstalledClientsDrawer } from './InstalledClientsDrawer'
import { GrowthDrawer } from './GrowthDrawer'
import { PlansDrawer } from './PlansDrawer'
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
  const [drawerEstado, setDrawerEstado] = useState<'Activo' | 'Suspendido' | null>(null)
  const [invoicesDrawer, setInvoicesDrawer] = useState<'revenue' | 'pending' | null>(null)
  const [installedDrawerOpen, setInstalledDrawerOpen] = useState(false)
  const [growthDrawerOpen, setGrowthDrawerOpen] = useState(false)
  const [plansDrawerOpen, setPlansDrawerOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
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
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Clientes activos"
          value={formatNumber(metrics.activeClients)}
          subtitle="Estado Activo en Wisphub"
          icon={Users}
          iconClassName="text-text-secondary"
          onClick={() => setDrawerEstado('Activo')}
        />
        <MetricCard
          title="Clientes suspendidos"
          value={formatNumber(metrics.suspendedClients)}
          subtitle="Estado Suspendido en Wisphub"
          icon={UserX}
          iconClassName="text-error"
          onClick={() => setDrawerEstado('Suspendido')}
        />
        <MetricCard
          title="Pendiente de recaudo"
          value={formatCOP(metrics.pendingDebt)}
          subtitle="Facturas pendientes y vencidas"
          icon={DollarSign}
          iconClassName="text-brand"
          onClick={() => setInvoicesDrawer('pending')}
        />
        <MetricCard
          title="Ingresos del mes"
          value={formatCOP(metrics.monthlyRevenue)}
          subtitle="Facturas pagadas este mes"
          icon={TrendingUp}
          iconClassName="text-brand"
          onClick={() => setInvoicesDrawer('revenue')}
        />
        <MetricCard
          title="Instalados este mes"
          value={formatNumber(metrics.installedThisMonth ?? 0)}
          subtitle="Nuevas instalaciones en el mes"
          icon={UserPlus}
          iconClassName="text-brand"
          onClick={() => setInstalledDrawerOpen(true)}
        />
        <MetricCard
          title="Crecimiento BEEPYRED"
          value="Ver evolución"
          subtitle="Histórico clientes e ingresos"
          icon={BarChart2}
          iconClassName="text-brand"
          onClick={() => setGrowthDrawerOpen(true)}
        />
        <MetricCard
          title="Distribución de planes"
          value="Ver planes"
          subtitle="Clientes y recaudo por plan"
          icon={Layers}
          iconClassName="text-brand"
          onClick={() => setPlansDrawerOpen(true)}
        />
      </div>

      <ClientsDrawer
        estado={drawerEstado}
        onClose={() => setDrawerEstado(null)}
      />
      <InvoicesDrawer
        type={invoicesDrawer}
        onClose={() => setInvoicesDrawer(null)}
      />
      <InstalledClientsDrawer
        isOpen={installedDrawerOpen}
        onClose={() => setInstalledDrawerOpen(false)}
      />
      <GrowthDrawer
        isOpen={growthDrawerOpen}
        onClose={() => setGrowthDrawerOpen(false)}
      />
      <PlansDrawer
        isOpen={plansDrawerOpen}
        onClose={() => setPlansDrawerOpen(false)}
      />
    </>
  )
}
