import { X, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGrowth } from '@/hooks/useGrowth'
import { exportToExcelMultiSheet, exportToPDFMultiSection } from '@/lib/export'
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
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.4)',
  fontSize: '12px',
}
const CHART_LABEL_STYLE = { color: '#FFFFFF' }
const CHART_ITEM_STYLE = { color: '#A1A1AA' }
const AXIS_TICK = { fill: '#71717A', fontSize: 11 }

export function GrowthDrawer({ isOpen, onClose }: GrowthDrawerProps) {
  const { data, isLoading, isError, error } = useGrowth()

  const hasData = !isLoading && !isError && !!data

  function handleExportExcel() {
    if (!data) return
    exportToExcelMultiSheet(
      [
        {
          name: 'Clientes',
          rows: data.clientGrowth.map(r => ({
            'Mes': formatMonthLabel(r.month),
            'Nuevos clientes': r.newClients,
            'Acumulado': r.totalClients,
          })),
        },
        {
          name: 'Ingresos',
          rows: data.revenueHistory.map(r => ({
            'Mes': formatMonthLabel(r.month),
            'Ingresos': r.revenue,
            'Acumulado': r.totalRevenue,
          })),
        },
      ],
      'crecimiento-beepyred'
    )
  }

  function handleExportPDF() {
    if (!data) return
    exportToPDFMultiSection(
      'Crecimiento BEEPYRED',
      [
        {
          subtitle: 'Evolución de clientes',
          columns: [
            { header: 'Mes', dataKey: 'Mes' },
            { header: 'Nuevos', dataKey: 'Nuevos clientes' },
            { header: 'Acumulado', dataKey: 'Acumulado' },
          ],
          rows: data.clientGrowth.map(r => ({
            'Mes': formatMonthLabel(r.month),
            'Nuevos clientes': r.newClients,
            'Acumulado': r.totalClients,
          })),
        },
        {
          subtitle: 'Ingresos mensuales',
          columns: [
            { header: 'Mes', dataKey: 'Mes' },
            { header: 'Ingresos', dataKey: 'Ingresos' },
            { header: 'Acumulado', dataKey: 'Acumulado' },
          ],
          rows: data.revenueHistory.map(r => ({
            'Mes': formatMonthLabel(r.month),
            'Ingresos': formatCOP(r.revenue),
            'Acumulado': formatCOP(r.totalRevenue),
          })),
        },
      ],
      'crecimiento-beepyred'
    )
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-[680px] max-w-[95vw]',
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">Crecimiento BEEPYRED</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Export row */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0 flex items-center gap-3">
          <div className="flex-1" />
          <button
            onClick={handleExportPDF}
            disabled={!hasData}
            title="Exportar PDF"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-muted hover:text-red-400 hover:bg-red-400/10 border border-border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!hasData}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold bg-brand text-black hover:bg-brand-hover transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar base de datos
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

          {isLoading && (
            <>
              <div className="h-[260px] rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-[260px] rounded-xl bg-white/[0.04] animate-pulse" />
            </>
          )}

          {isError && (
            <div className="rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar datos de crecimiento</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener el historial'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && (
            <>
              {/* Sección Clientes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
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
                      labelFormatter={(label) => formatMonthLabel(String(label ?? ''))}
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
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
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
                      labelFormatter={(label) => formatMonthLabel(String(label ?? ''))}
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
                      dot={{ r: 4, fill: '#FFFFFF' }}
                      activeDot={{ r: 6 }}
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
