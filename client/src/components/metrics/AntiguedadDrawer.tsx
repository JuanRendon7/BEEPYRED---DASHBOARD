import { X, Clock, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAntiguedad } from '@/hooks/useAntiguedad'
import { exportToExcel, exportToPDF } from '@/lib/export'
import type { AntiguedadDistribution } from '@/types/api'

function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n)
}

interface BucketRowProps {
  label: string
  count: number
  total: number
  colorClass: string
}

function BucketRow({ label, count, total, colorClass }: BucketRowProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {formatNumber(count)}
          <span className="text-xs text-text-muted ml-2">{pct}%</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5">
        <div
          className={cn('h-1.5 rounded-full bg-brand transition-all duration-700 ease-out', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface AntiguedadDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const BUCKETS: Array<{ key: keyof AntiguedadDistribution; label: string; colorClass: string }> = [
  { key: 'menosDe6Meses', label: 'Menos de 6 meses', colorClass: 'bg-yellow-400' },
  { key: 'de6A12Meses',   label: '6 a 12 meses',     colorClass: 'bg-brand' },
  { key: 'de1A2Anos',     label: '1 a 2 años',        colorClass: 'bg-blue-400' },
  { key: 'masDe2Anos',    label: 'Más de 2 años',     colorClass: 'bg-green-400' },
]

const PDF_COLUMNS = [
  { header: 'Tramo de antigüedad', dataKey: 'Tramo' },
  { header: 'Clientes', dataKey: 'Clientes' },
  { header: 'Porcentaje', dataKey: 'Porcentaje' },
]

export function AntiguedadDrawer({ isOpen, onClose }: AntiguedadDrawerProps) {
  const { data, isLoading, isError, error } = useAntiguedad()

  const title = 'Antigüedad promedio de clientes'
  const hasData = !isLoading && !isError && !!data && data.totalClientes > 0

  function buildRows() {
    if (!data) return []
    const total = data.totalClientes
    return BUCKETS.map(({ key, label }) => {
      const count = data.distribution[key]
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return { 'Tramo': label, 'Clientes': count, 'Porcentaje': `${pct}%` }
    })
  }

  function handleExportExcel() {
    exportToExcel(buildRows(), 'antiguedad-clientes-beepyred', 'Antigüedad')
  }

  function handleExportPDF() {
    if (!data) return
    exportToPDF(
      `${title} — Promedio: ${data.avgLabel}`,
      PDF_COLUMNS,
      buildRows(),
      'antiguedad-clientes-beepyred'
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
          'fixed inset-y-0 right-0 z-40 w-[520px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Promedio destacado — featured banner */}
        {!isLoading && !isError && data && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-brand/5 to-transparent">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Antigüedad promedio
              </span>
            </div>
            <p className="text-base font-bold text-text-primary mt-1">{data.avgLabel}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Sobre {formatNumber(data.totalClientes)} clientes activos
            </p>
          </div>
        )}

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar antigüedad</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener los datos de antigüedad'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && data.totalClientes === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay datos de antigüedad disponibles.</p>
            </div>
          )}

          {!isLoading && !isError && data && data.totalClientes > 0 && (
            <div className="px-6 py-4 space-y-5">
              {BUCKETS.map(({ key, label, colorClass }) => (
                <BucketRow
                  key={key}
                  label={label}
                  count={data.distribution[key]}
                  total={data.totalClientes}
                  colorClass={colorClass}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !isError && data && data.totalClientes > 0 && (
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Total clientes activos
            </span>
            <span className="text-sm font-bold text-brand tabular-nums">
              {formatNumber(data.totalClientes)}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
