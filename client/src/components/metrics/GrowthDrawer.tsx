import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGrowth } from '@/hooks/useGrowth'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface GrowthDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatMonthLabel(month: string): string {
  const [yyyy, mm] = month.split('-')
  const monthIndex = parseInt(mm, 10) - 1
  return `${MONTHS[monthIndex]} ${yyyy.slice(2)}`
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCOPShort(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#18181B',
  border: '1px solid #27272A',
  borderRadius: '8px',
}
const CHART_LABEL_STYLE = { color: '#FFFFFF' }
const CHART_ITEM_STYLE = { color: '#A1A1AA' }
const AXIS_TICK = { fill: '#71717A', fontSize: 11 }

export function GrowthDrawer({ isOpen, onClose }: GrowthDrawerProps) {
  const { data, isLoading, isError, error } = useGrowth()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-[700px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Crecimiento BEEPYRED"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">Crecimiento BEEPYRED</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {isLoading && (
            <>
              <div className="h-[260px] rounded-lg bg-white/5 animate-pulse" />
              <div className="h-[260px] rounded-lg bg-white/5 animate-pulse" />
            </>
          )}

          {isError && (
            <div className="p-4 rounded-lg border border-error/30 bg-error/10">
              <p className="text-sm text-error">Error al cargar datos de crecimiento</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener el historial'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && (
            <>
              {/* Sección Clientes */}
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Evolución de clientes
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={data.clientGrowth} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonthLabel}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelStyle={CHART_LABEL_STYLE}
                      itemStyle={CHART_ITEM_STYLE}
                      labelFormatter={formatMonthLabel}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="newClients"
                      name="Nuevos"
                      fill="#F5A800"
                      opacity={0.8}
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalClients"
                      name="Acumulado"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="border-b border-border" />

              {/* Sección Ingresos */}
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Ingresos mensuales
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={data.revenueHistory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonthLabel}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={formatCOPShort}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={formatCOPShort}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelStyle={CHART_LABEL_STYLE}
                      itemStyle={CHART_ITEM_STYLE}
                      labelFormatter={formatMonthLabel}
                      formatter={(value, name) =>
                        name === 'Ingresos' || name === 'Acumulado'
                          ? [formatCOP(value as number), name]
                          : [value, name]
                      }
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Ingresos"
                      fill="#F5A800"
                      opacity={0.8}
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalRevenue"
                      name="Acumulado"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
