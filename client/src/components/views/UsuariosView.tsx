import { useState } from 'react'
import { Users, UserX, MapPin, Clock, Layers, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useMetrics } from '@/hooks/useMetrics'
import { useZones } from '@/hooks/useZones'
import { usePlans } from '@/hooks/usePlans'
import { useAntiguedad } from '@/hooks/useAntiguedad'
import { MetricCard } from '@/components/metrics/MetricCard'
import { ClientsDrawer } from '@/components/metrics/ClientsDrawer'
import { ZonesDrawer } from '@/components/metrics/ZonesDrawer'
import { PlansDrawer } from '@/components/metrics/PlansDrawer'
import { AntiguedadDrawer } from '@/components/metrics/AntiguedadDrawer'

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
const formatNum = (n: number) => new Intl.NumberFormat('es-CO').format(n)

const PALETTE = ['#F5A800', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#6366F1', '#14B8A6']

function AntiguedadTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-brand">{formatNum(payload[0]?.value ?? 0)} clientes</p>
    </div>
  )
}

export function UsuariosView() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics()
  const { data: zones, isLoading: zonesLoading } = useZones()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: antiguedad, isLoading: antiguedadLoading } = useAntiguedad()
  const [drawerEstado, setDrawerEstado] = useState<'Activo' | 'Suspendido' | null>(null)
  const [zonesOpen, setZonesOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(false)
  const [antiguedadOpen, setAntiguedadOpen] = useState(false)

  const topZones = zones?.zones.slice(0, 9) ?? []
  const topPlans = plans?.plans.slice(0, 9) ?? []

  const antiguedadChartData = antiguedad
    ? [
        { label: '< 6 meses', value: antiguedad.distribution.menosDe6Meses },
        { label: '6–12 meses', value: antiguedad.distribution.de6A12Meses },
        { label: '1–2 años', value: antiguedad.distribution.de1A2Anos },
        { label: '> 2 años', value: antiguedad.distribution.masDe2Anos },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Usuarios</h2>
        <p className="text-sm text-text-muted mt-1">Clientes, zonas y distribución de planes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
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
          title="Zonas activas"
          value={zones ? formatNum(zones.totalZonas) : '—'}
          subtitle={zones ? `${zones.zonaConMasClientes ?? '—'} lidera` : 'Zonas registradas'}
          icon={MapPin}
          iconClassName="text-brand"
          isLoading={zonesLoading}
          onClick={() => setZonesOpen(true)}
        />
        <MetricCard
          title="Antigüedad promedio"
          value={antiguedad?.avgLabel ?? '—'}
          subtitle={antiguedad ? `${formatNum(antiguedad.totalClientes)} clientes analizados` : 'Clientes activos'}
          icon={Clock}
          iconClassName="text-brand"
          isLoading={antiguedadLoading}
          onClick={() => setAntiguedadOpen(true)}
        />
      </div>

      {/* Zones + Plans tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Zones */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Distribución por zona</p>
              <p className="text-xs text-text-muted mt-0.5">
                {zones?.totalZonas ?? 0} zonas · {zones ? formatNum(zones.totalClientes) : 0} clientes
              </p>
            </div>
            <MapPin className="h-4 w-4 text-text-muted" />
          </div>

          <div>
            <div className="flex items-center gap-3 pb-2 mb-1 border-b border-border text-[10px] text-text-muted">
              <span className="flex-1">Zona</span>
              <span className="text-right w-16">Clientes</span>
              <span className="text-right w-28">Recaudo</span>
            </div>
            {zonesLoading ? (
              [...Array(7)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-white/5 animate-pulse mt-1" />
              ))
            ) : (
              topZones.map((z, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/25 last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <p className="text-xs text-text-primary truncate">{z.nombre}</p>
                  </div>
                  <p className="text-xs font-medium text-text-secondary text-right w-16">{formatNum(z.clientCount)}</p>
                  <p className="text-xs font-semibold text-brand text-right w-28">{formatCOP(z.recaudo)}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setZonesOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver todas las zonas <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* Plans */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Distribución por plan</p>
              <p className="text-xs text-text-muted mt-0.5">
                {plans?.totalPlanes ?? 0} planes · {plans ? formatNum(plans.totalClientes) : 0} clientes
              </p>
            </div>
            <Layers className="h-4 w-4 text-text-muted" />
          </div>

          <div>
            <div className="flex items-center gap-3 pb-2 mb-1 border-b border-border text-[10px] text-text-muted">
              <span className="flex-1">Plan</span>
              <span className="text-right w-16">Clientes</span>
              <span className="text-right w-28">Recaudo</span>
            </div>
            {plansLoading ? (
              [...Array(7)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-white/5 animate-pulse mt-1" />
              ))
            ) : (
              topPlans.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/25 last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <p className="text-xs text-text-primary truncate">{p.nombre}</p>
                  </div>
                  <p className="text-xs font-medium text-text-secondary text-right w-16">{formatNum(p.clientCount)}</p>
                  <p className="text-xs font-semibold text-brand text-right w-28">{formatCOP(p.recaudo)}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setPlansOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver todos los planes <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Antigüedad chart */}
      <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Antigüedad de clientes</p>
            <p className="text-xs text-text-muted mt-0.5">
              Distribución por tiempo como cliente · Promedio: {antiguedad?.avgLabel ?? '—'}
            </p>
          </div>
          <button
            onClick={() => setAntiguedadOpen(true)}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand-hover transition-colors"
          >
            Ver detalle <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        {antiguedadLoading ? (
          <div className="h-36 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={antiguedadChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<AntiguedadTooltip />} cursor={{ fill: 'rgba(245,168,0,0.05)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {antiguedadChartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 flex-wrap">
              {antiguedadChartData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  <p className="text-[10px] text-text-muted">{d.label}: {formatNum(d.value)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ClientsDrawer estado={drawerEstado} onClose={() => setDrawerEstado(null)} />
      <ZonesDrawer isOpen={zonesOpen} onClose={() => setZonesOpen(false)} />
      <PlansDrawer isOpen={plansOpen} onClose={() => setPlansOpen(false)} />
      <AntiguedadDrawer isOpen={antiguedadOpen} onClose={() => setAntiguedadOpen(false)} />
    </div>
  )
}
