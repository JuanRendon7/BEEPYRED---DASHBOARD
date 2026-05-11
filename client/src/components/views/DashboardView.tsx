import { useState } from 'react'
import { Users, UserX, DollarSign, TrendingUp, UserPlus, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMetrics } from '@/hooks/useMetrics'
import { useMora } from '@/hooks/useMora'
import { useGrowth } from '@/hooks/useGrowth'
import { MetricCard } from '@/components/metrics/MetricCard'
import { ClientsDrawer } from '@/components/metrics/ClientsDrawer'
import { MoraDrawer } from '@/components/metrics/MoraDrawer'
import { InvoicesDrawer } from '@/components/metrics/InvoicesDrawer'
import { InstalledClientsDrawer } from '@/components/metrics/InstalledClientsDrawer'
import { CompromisosCard } from '@/components/metrics/CompromisosCard'

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
const formatNum = (n: number) => new Intl.NumberFormat('es-CO').format(n)

function GrowthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name === 'newClients' ? 'Nuevos' : 'Total'}: {formatNum(p.value)}
        </p>
      ))}
    </div>
  )
}

export function DashboardView() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics()
  const { data: mora, isLoading: moraLoading } = useMora()
  const { data: growth, isLoading: growthLoading } = useGrowth()
  const [drawerEstado, setDrawerEstado] = useState<'Activo' | 'Suspendido' | null>(null)
  const [moraOpen, setMoraOpen] = useState(false)
  const [invoicesDrawer, setInvoicesDrawer] = useState<'revenue' | 'pending' | null>(null)
  const [installedOpen, setInstalledOpen] = useState(false)

  const chartData = growth?.clientGrowth.slice(-9) ?? []

  const moraRate =
    metrics && metrics.activeClients + metrics.suspendedClients > 0
      ? (((mora?.totalClientesEnMora ?? 0) / (metrics.activeClients + metrics.suspendedClients)) * 100).toFixed(1)
      : null

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Resumen Ejecutivo</h2>
        <p className="text-sm text-text-muted mt-1">Vista consolidada del estado actual de BEEPYRED</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          title="Clientes activos"
          value={metrics ? formatNum(metrics.activeClients) : '—'}
          subtitle="Estado Activo en Wisphub"
          icon={Users}
          iconClassName="text-text-secondary"
          isLoading={metricsLoading}
          onClick={() => setDrawerEstado('Activo')}
        />
        <MetricCard
          title="Clientes suspendidos"
          value={metrics ? formatNum(metrics.suspendedClients) : '—'}
          subtitle="Estado Suspendido"
          icon={UserX}
          iconClassName="text-error"
          isLoading={metricsLoading}
          onClick={() => setDrawerEstado('Suspendido')}
        />
        <MetricCard
          title="Ingresos del mes"
          value={metrics ? formatCOP(metrics.monthlyRevenue) : '—'}
          subtitle="Facturas pagadas este mes"
          icon={TrendingUp}
          iconClassName="text-brand"
          isLoading={metricsLoading}
          onClick={() => setInvoicesDrawer('revenue')}
        />
        <MetricCard
          title="Pendiente de recaudo"
          value={metrics ? formatCOP(metrics.pendingDebt) : '—'}
          subtitle="Facturas pendientes"
          icon={DollarSign}
          iconClassName="text-brand"
          isLoading={metricsLoading}
          onClick={() => setInvoicesDrawer('pending')}
        />
        <MetricCard
          title="Instalados este mes"
          value={metrics ? formatNum(metrics.installedThisMonth ?? 0) : '—'}
          subtitle="Nuevas instalaciones"
          icon={UserPlus}
          iconClassName="text-brand"
          isLoading={metricsLoading}
          onClick={() => setInstalledOpen(true)}
        />
        <MetricCard
          title="Clientes en mora"
          value={
            mora
              ? `${formatNum(mora.totalClientesEnMora)}${moraRate ? ` (${moraRate}%)` : ''}`
              : '—'
          }
          subtitle={mora ? formatCOP(mora.totalMontoMora) + ' en mora total' : 'Con facturas vencidas'}
          icon={AlertTriangle}
          iconClassName="text-red-400"
          isLoading={moraLoading}
          onClick={() => setMoraOpen(true)}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Growth area chart */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Evolución de clientes</p>
              <p className="text-xs text-text-muted mt-0.5">Nuevos clientes por mes — últimos 9 meses</p>
            </div>
            <Activity className="h-4 w-4 text-text-muted" />
          </div>
          {growthLoading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5A800" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashGradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GrowthTooltip />} />
                <Area type="monotone" dataKey="newClients" stroke="#F5A800" strokeWidth={2} fill="url(#dashGradNew)" dot={false} activeDot={{ r: 4, fill: '#F5A800' }} />
                <Area type="monotone" dataKey="totalClients" stroke="#3B82F6" strokeWidth={2} fill="url(#dashGradTotal)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full bg-brand" />
              <p className="text-[10px] text-text-muted">Nuevos clientes</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full bg-blue-500" />
              <p className="text-[10px] text-text-muted">Total acumulado</p>
            </div>
          </div>
        </div>

        {/* Top mora table */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Top mora</p>
              <p className="text-xs text-text-muted mt-0.5">Mayor deuda vencida</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>

          {moraLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : mora?.clientesEnMora.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">Sin clientes en mora</p>
          ) : (
            <div className="space-y-1">
              {mora?.clientesEnMora.slice(0, 7).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-text-muted w-4 shrink-0">{i + 1}</span>
                    <p className="text-xs text-text-primary truncate">{c.nombre}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-semibold text-red-400">{formatCOP(c.totalMora)}</p>
                    <p className="text-[10px] text-text-muted">{c.diasMaxAtraso}d</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setMoraOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver cartera completa <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <CompromisosCard />

      <ClientsDrawer estado={drawerEstado} onClose={() => setDrawerEstado(null)} />
      <MoraDrawer isOpen={moraOpen} onClose={() => setMoraOpen(false)} />
      <InvoicesDrawer type={invoicesDrawer} onClose={() => setInvoicesDrawer(null)} />
      <InstalledClientsDrawer isOpen={installedOpen} onClose={() => setInstalledOpen(false)} />
    </div>
  )
}
