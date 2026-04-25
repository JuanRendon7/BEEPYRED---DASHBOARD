import { useState } from 'react'
import { UserPlus, TrendingUp, BarChart2, Users, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useGrowth } from '@/hooks/useGrowth'
import { useInstalledClients } from '@/hooks/useInstalledClients'
import { useMetrics } from '@/hooks/useMetrics'
import { MetricCard } from '@/components/metrics/MetricCard'
import { GrowthDrawer } from '@/components/metrics/GrowthDrawer'
import { InstalledClientsDrawer } from '@/components/metrics/InstalledClientsDrawer'

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
const formatNum = (n: number) => new Intl.NumberFormat('es-CO').format(n)
const formatCOPK = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return formatCOP(n)
}

function ClientTooltip({ active, payload, label }: any) {
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

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      <p className="text-sm font-semibold text-brand">{formatCOP(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

export function CrecimientoView() {
  const { data: growth, isLoading: growthLoading } = useGrowth()
  const { data: installed, isLoading: installedLoading } = useInstalledClients()
  const { data: metrics, isLoading: metricsLoading } = useMetrics()
  const [growthDrawerOpen, setGrowthDrawerOpen] = useState(false)
  const [installedOpen, setInstalledOpen] = useState(false)

  const lastTwo = growth?.clientGrowth.slice(-2) ?? []
  const growthPct =
    lastTwo.length === 2 && lastTwo[0].totalClients > 0
      ? (((lastTwo[1].totalClients - lastTwo[0].totalClients) / lastTwo[0].totalClients) * 100).toFixed(1)
      : null

  const lastTwoRev = growth?.revenueHistory.slice(-2) ?? []
  const revGrowthPct =
    lastTwoRev.length === 2 && lastTwoRev[0].revenue > 0
      ? (((lastTwoRev[1].revenue - lastTwoRev[0].revenue) / lastTwoRev[0].revenue) * 100).toFixed(1)
      : null

  const chartData = growth?.clientGrowth ?? []
  const revenueData = growth?.revenueHistory ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Crecimiento</h2>
        <p className="text-sm text-text-muted mt-1">Evolución histórica de clientes e ingresos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Instalados este mes"
          value={installed ? formatNum(installed.totalCount) : (metrics ? formatNum(metrics.installedThisMonth ?? 0) : '—')}
          subtitle={installed ? formatCOP(installed.totalRevenue) + ' en nuevos planes' : 'Nuevas instalaciones'}
          icon={UserPlus}
          iconClassName="text-brand"
          isLoading={installedLoading}
          onClick={() => setInstalledOpen(true)}
        />
        <MetricCard
          title="Crecimiento clientes"
          value={growthPct !== null ? `${parseFloat(growthPct) >= 0 ? '+' : ''}${growthPct}%` : '—'}
          subtitle="Variación vs mes anterior"
          icon={TrendingUp}
          iconClassName={growthPct !== null && parseFloat(growthPct) >= 0 ? 'text-green-400' : 'text-red-400'}
          isLoading={growthLoading}
          onClick={() => setGrowthDrawerOpen(true)}
        />
        <MetricCard
          title="Crecimiento ingresos"
          value={revGrowthPct !== null ? `${parseFloat(revGrowthPct) >= 0 ? '+' : ''}${revGrowthPct}%` : '—'}
          subtitle="Variación recaudo vs mes anterior"
          icon={BarChart2}
          iconClassName={revGrowthPct !== null && parseFloat(revGrowthPct) >= 0 ? 'text-green-400' : 'text-red-400'}
          isLoading={growthLoading}
          onClick={() => setGrowthDrawerOpen(true)}
        />
        <MetricCard
          title="Total clientes"
          value={metrics ? formatNum(metrics.activeClients + metrics.suspendedClients) : '—'}
          subtitle={metrics ? `${formatNum(metrics.activeClients)} activos` : 'Activos + suspendidos'}
          icon={Users}
          iconClassName="text-text-secondary"
          isLoading={metricsLoading}
        />
      </div>

      {/* Client growth area chart */}
      <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Evolución de clientes</p>
            <p className="text-xs text-text-muted mt-0.5">Nuevos clientes y total acumulado por mes</p>
          </div>
          <button
            onClick={() => setGrowthDrawerOpen(true)}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand-hover transition-colors"
          >
            Ver detalle <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        {growthLoading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="crecGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A800" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5A800" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="crecGradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ClientTooltip />} />
                <Area type="monotone" dataKey="newClients" stroke="#F5A800" strokeWidth={2} fill="url(#crecGradNew)" dot={false} activeDot={{ r: 4, fill: '#F5A800' }} />
                <Area type="monotone" dataKey="totalClients" stroke="#3B82F6" strokeWidth={2} fill="url(#crecGradTotal)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-brand" />
                <p className="text-[10px] text-text-muted">Nuevos / mes</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-blue-500" />
                <p className="text-[10px] text-text-muted">Total acumulado</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Revenue chart + installed table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue bar chart */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Recaudo histórico</p>
              <p className="text-xs text-text-muted mt-0.5">Ingresos mensuales</p>
            </div>
          </div>
          {growthLoading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#71717A', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCOPK}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(245,168,0,0.05)' }} />
                <Bar dataKey="revenue" fill="#F5A800" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Installed this month */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Instalados este mes</p>
              <p className="text-xs text-text-muted mt-0.5">
                {installed ? formatCOP(installed.totalRevenue) : '—'} en planes
              </p>
            </div>
            <UserPlus className="h-4 w-4 text-text-muted" />
          </div>

          {installedLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : installed?.clients.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">Sin instalaciones este mes</p>
          ) : (
            <div className="space-y-1">
              {installed?.clients.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/25 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs text-text-primary truncate">{c.nombre}</p>
                    <p className="text-[10px] text-text-muted">{c.zona ?? 'Sin zona'}</p>
                  </div>
                  <p className="text-xs font-semibold text-brand shrink-0 ml-2">{formatCOP(c.precioPlan)}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setInstalledOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <GrowthDrawer isOpen={growthDrawerOpen} onClose={() => setGrowthDrawerOpen(false)} />
      <InstalledClientsDrawer isOpen={installedOpen} onClose={() => setInstalledOpen(false)} />
    </div>
  )
}
