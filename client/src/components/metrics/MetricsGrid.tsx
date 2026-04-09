import { useState } from 'react'
import { Users, UserX, DollarSign, TrendingUp, UserPlus, BarChart2, Layers, MapPin, AlertTriangle, Clock, Briefcase, Percent, Scale } from 'lucide-react'
import { useMetrics } from '@/hooks/useMetrics'
import { MetricCard } from './MetricCard'
import { MetricCardSkeleton } from './MetricCardSkeleton'
import { ClientsDrawer } from './ClientsDrawer'
import { InvoicesDrawer } from './InvoicesDrawer'
import { InstalledClientsDrawer } from './InstalledClientsDrawer'
import { GrowthDrawer } from './GrowthDrawer'
import { PlansDrawer } from './PlansDrawer'
import { ZonesDrawer } from './ZonesDrawer'
import { MoraDrawer } from './MoraDrawer'
import { AntiguedadDrawer } from './AntiguedadDrawer'
import { InversionDrawer } from './InversionDrawer'
import { useZones } from '@/hooks/useZones'
import { useMora } from '@/hooks/useMora'
import { useAntiguedad } from '@/hooks/useAntiguedad'
import { useInversion } from '@/hooks/useInversion'
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
  const { data: zonesData, isLoading: zonesLoading } = useZones()
  const { data: moraData, isLoading: moraLoading } = useMora()
  const { data: antiguedadData, isLoading: antiguedadLoading } = useAntiguedad()
  const { data: inversionData, isLoading: inversionLoading } = useInversion()
  const [drawerEstado, setDrawerEstado] = useState<'Activo' | 'Suspendido' | null>(null)
  const [invoicesDrawer, setInvoicesDrawer] = useState<'revenue' | 'pending' | null>(null)
  const [installedDrawerOpen, setInstalledDrawerOpen] = useState(false)
  const [growthDrawerOpen, setGrowthDrawerOpen] = useState(false)
  const [plansDrawerOpen, setPlansDrawerOpen] = useState(false)
  const [zonesDrawerOpen, setZonesDrawerOpen] = useState(false)
  const [moraDrawerOpen, setMoraDrawerOpen] = useState(false)
  const [antiguedadDrawerOpen, setAntiguedadDrawerOpen] = useState(false)
  const [inversionDrawerOpen, setInversionDrawerOpen] = useState(false)

  const anyLoading = isLoading || zonesLoading || moraLoading || antiguedadLoading || inversionLoading

  if (anyLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
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

  // Métricas derivadas — calculadas en cliente con data existente
  const tasaMora = metrics.activeClients > 0 && moraData
    ? `${((moraData.totalClientesEnMora / metrics.activeClients) * 100).toFixed(1)}%`
    : '—'
  const tasaMoraSubtitle = moraData
    ? `${formatNumber(moraData.totalClientesEnMora)} de ${formatNumber(metrics.activeClients)} clientes activos`
    : 'de clientes activos'

  const ratioDeuda = metrics.monthlyRevenue > 0
    ? `${(metrics.pendingDebt / metrics.monthlyRevenue).toFixed(1)} meses`
    : '—'
  const ratioDeudaSubtitle = metrics.monthlyRevenue > 0
    ? `${formatCOP(metrics.pendingDebt)} ÷ ${formatCOP(metrics.monthlyRevenue)}/mes`
    : 'deuda ÷ ingresos del mes'

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
          subtitle="Basado en facturas API · puede diferir de Wisphub"
          icon={DollarSign}
          iconClassName="text-brand"
          onClick={() => setInvoicesDrawer('pending')}
        />
        <MetricCard
          title="Ingresos del mes"
          value={formatCOP(metrics.monthlyRevenue)}
          subtitle="Basado en facturas API · puede diferir de Wisphub"
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
        <MetricCard
          title="Clientes por zona"
          value={zonesData?.zonaConMasClientes ?? '—'}
          subtitle={zonesData ? `${zonesData.totalZonas} zonas activas` : 'Zonas activas'}
          icon={MapPin}
          iconClassName="text-brand"
          onClick={() => setZonesDrawerOpen(true)}
        />
        <MetricCard
          title="Clientes en mora"
          value={moraData ? formatNumber(moraData.totalClientesEnMora) : '—'}
          subtitle="Con facturas vencidas"
          icon={AlertTriangle}
          iconClassName="text-red-400"
          onClick={() => setMoraDrawerOpen(true)}
        />
        <MetricCard
          title="Antigüedad promedio"
          value={antiguedadData?.avgLabel ?? '—'}
          subtitle="Clientes activos"
          icon={Clock}
          iconClassName="text-brand"
          onClick={() => setAntiguedadDrawerOpen(true)}
        />
        <MetricCard
          title="Inversión accionistas"
          value={inversionData ? formatCOP(inversionData.totalGeneral) : '—'}
          subtitle={inversionData ? `${inversionData.accionistas.length} accionistas · inversión acumulada` : 'Inversión acumulada'}
          icon={Briefcase}
          iconClassName="text-brand"
          onClick={() => setInversionDrawerOpen(true)}
        />
        <MetricCard
          title="Tasa de mora"
          value={tasaMora}
          subtitle={tasaMoraSubtitle}
          icon={Percent}
          iconClassName="text-orange-400"
          onClick={() => setMoraDrawerOpen(true)}
        />
        <MetricCard
          title="Ratio deuda / ingresos"
          value={ratioDeuda}
          subtitle={ratioDeudaSubtitle}
          icon={Scale}
          iconClassName="text-amber-400"
          onClick={() => setInvoicesDrawer('pending')}
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
      <ZonesDrawer
        isOpen={zonesDrawerOpen}
        onClose={() => setZonesDrawerOpen(false)}
      />
      <MoraDrawer
        isOpen={moraDrawerOpen}
        onClose={() => setMoraDrawerOpen(false)}
      />
      <AntiguedadDrawer
        isOpen={antiguedadDrawerOpen}
        onClose={() => setAntiguedadDrawerOpen(false)}
      />
      <InversionDrawer
        isOpen={inversionDrawerOpen}
        onClose={() => setInversionDrawerOpen(false)}
      />
    </>
  )
}
