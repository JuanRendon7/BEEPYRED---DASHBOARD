import { useState } from 'react'
import { DollarSign, TrendingUp, AlertTriangle, Briefcase, ArrowUpRight, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMetrics } from '@/hooks/useMetrics'
import { useMora } from '@/hooks/useMora'
import { useInversion } from '@/hooks/useInversion'
import { useGrowth } from '@/hooks/useGrowth'
import { useCobranza } from '@/hooks/useCobranza'
import { MetricCard } from '@/components/metrics/MetricCard'
import { InvoicesDrawer } from '@/components/metrics/InvoicesDrawer'
import { MoraDrawer } from '@/components/metrics/MoraDrawer'
import { InversionDrawer } from '@/components/metrics/InversionDrawer'

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
const formatNum = (n: number) => new Intl.NumberFormat('es-CO').format(n)
const formatCOPK = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return formatCOP(n)
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

export function FinancieroView() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics()
  const { data: mora, isLoading: moraLoading } = useMora()
  const { data: inversion, isLoading: inversionLoading } = useInversion()
  const { data: growth, isLoading: growthLoading } = useGrowth()
  const { data: cobranza, isLoading: cobranzaLoading } = useCobranza()
  const [invoicesDrawer, setInvoicesDrawer] = useState<'revenue' | 'pending' | null>(null)
  const [moraOpen, setMoraOpen] = useState(false)
  const [inversionOpen, setInversionOpen] = useState(false)

  const revenueData = growth?.revenueHistory.slice(-10) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Financiero</h2>
        <p className="text-sm text-text-muted mt-1">Ingresos, recaudo y estado de cartera</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          title="Ingresos del mes"
          value={metrics ? formatCOP(metrics.monthlyRevenue) : '—'}
          subtitle="Facturas pagadas"
          icon={TrendingUp}
          iconClassName="text-brand"
          isLoading={metricsLoading}
          onClick={() => setInvoicesDrawer('revenue')}
        />
        <MetricCard
          title="Pendiente de recaudo"
          value={metrics ? formatCOP(metrics.pendingDebt) : '—'}
          subtitle="Por cobrar"
          icon={DollarSign}
          iconClassName="text-brand"
          isLoading={metricsLoading}
          onClick={() => setInvoicesDrawer('pending')}
        />
        <MetricCard
          title="Total en mora"
          value={mora ? formatCOP(mora.totalMontoMora) : '—'}
          subtitle={mora ? `${formatNum(mora.totalClientesEnMora)} clientes vencidos` : 'Deuda vencida'}
          icon={AlertTriangle}
          iconClassName="text-red-400"
          isLoading={moraLoading}
          onClick={() => setMoraOpen(true)}
        />
        <MetricCard
          title="Inversión accionistas"
          value={inversion ? formatCOP(inversion.totalGeneral) : '—'}
          subtitle={inversion ? `${inversion.accionistas.length} accionistas` : 'Capital invertido'}
          icon={Briefcase}
          iconClassName="text-brand"
          isLoading={inversionLoading}
          onClick={() => setInversionOpen(true)}
        />
<MetricCard
          title="Tiempo promedio de pago"
          value={cobranza ? `${cobranza.avgPaymentDays} días` : '—'}
          subtitle={
            cobranza
              ? `Histórico: ${cobranza.tasaCobranzaGeneral}% cobrado sobre ${cobranza.facturasEmitidasTotal.toLocaleString('es-CO')} facturas`
              : 'Entre emisión y pago'
          }
          icon={Clock}
          iconClassName="text-brand"
          isLoading={cobranzaLoading}
        />
      </div>

      {/* Revenue history chart */}
      <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Recaudo mensual</p>
            <p className="text-xs text-text-muted mt-0.5">Ingresos por mes — últimos 10 meses</p>
          </div>
        </div>
        {growthLoading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
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
              <Bar dataKey="revenue" fill="#F5A800" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row: mora + inversión */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Mora table */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Cartera vencida</p>
              <p className="text-xs text-text-muted mt-0.5">Clientes con facturas vencidas</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-3 pb-2 mb-1 border-b border-border">
              <span className="text-[10px] text-text-muted w-5">#</span>
              <span className="text-[10px] text-text-muted flex-1">Cliente</span>
              <span className="text-[10px] text-text-muted text-right w-24">Monto</span>
              <span className="text-[10px] text-text-muted text-right w-14">Atraso</span>
            </div>
            {moraLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse mt-1" />
              ))
            ) : mora?.clientesEnMora.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">Sin cartera vencida</p>
            ) : (
              mora?.clientesEnMora.slice(0, 9).map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/25 last:border-0">
                  <span className="text-[10px] text-text-muted w-5">{i + 1}</span>
                  <p className="text-xs text-text-primary flex-1 truncate">{c.nombre}</p>
                  <p className="text-xs font-semibold text-red-400 text-right w-24">{formatCOP(c.totalMora)}</p>
                  <p className="text-xs text-text-muted text-right w-14">{c.diasMaxAtraso}d</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setMoraOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver cartera completa <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* Inversión accionistas */}
        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">Inversión por accionista</p>
              <p className="text-xs text-text-muted mt-0.5">Capital invertido acumulado</p>
            </div>
            <Briefcase className="h-4 w-4 text-text-muted" />
          </div>

          {inversionLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {inversion?.accionistas.map(a => (
                <div key={a.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">{a.nombre}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand">{formatCOP(a.total)}</p>
                      <p className="text-[10px] text-text-muted">{a.porcentaje.toFixed(1)}% del total</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand/70 to-brand transition-all duration-700"
                      style={{ width: `${a.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
              {inversion && (
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-text-muted">Total invertido</p>
                  <p className="text-sm font-bold text-text-primary">{formatCOP(inversion.totalGeneral)}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setInversionOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors py-2 rounded-lg hover:bg-brand/5"
          >
            Ver transacciones <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <InvoicesDrawer type={invoicesDrawer} onClose={() => setInvoicesDrawer(null)} />
      <MoraDrawer isOpen={moraOpen} onClose={() => setMoraOpen(false)} />
      <InversionDrawer isOpen={inversionOpen} onClose={() => setInversionOpen(false)} />
    </div>
  )
}
