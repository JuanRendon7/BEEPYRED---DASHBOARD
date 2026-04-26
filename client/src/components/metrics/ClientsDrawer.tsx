import { useState } from 'react'
import { X, Search, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import { exportToExcel, exportToPDF } from '@/lib/export'
import type { BffClient } from '@/types/api'

interface ClientsDrawerProps {
  estado: 'Activo' | 'Suspendido' | null  // null = cerrado
  onClose: () => void
}

function abbreviateZona(zona: string | null): string | null {
  if (!zona) return null
  const lower = zona.toLowerCase()
  if (lower.includes('nodo principal') || lower.includes('nodo_principal')) return 'Nodo principal'
  if (lower.includes('prodigio')) return 'Prodigio'
  if (lower.includes('altavista')) return 'Altavista'
  if (lower.includes('rioclaro') || lower.includes('río claro') || lower.includes('rio claro')) return 'Rioclaro'
  return zona
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const PDF_COLUMNS = [
  { header: 'ID', dataKey: 'ID Servicio' },
  { header: 'Nombre', dataKey: 'Nombre' },
  { header: 'Plan', dataKey: 'Plan' },
  { header: 'Zona', dataKey: 'Zona' },
  { header: 'Precio/mes', dataKey: 'Precio Plan' },
  { header: 'Deuda', dataKey: 'Deuda' },
  { header: 'Est. Facturas', dataKey: 'Estado Facturas' },
  { header: 'F. Instalación', dataKey: 'Fecha Instalación' },
]

function buildRows(clients: BffClient[]) {
  return clients.map(c => ({
    'ID Servicio': c.id_servicio,
    'Nombre': c.nombre,
    'Estado': c.estado,
    'Plan': c.plan ?? '—',
    'Precio Plan': c.precio_plan > 0
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(c.precio_plan)
      : '—',
    'Zona': c.zona ?? '—',
    'Deuda': new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(c.saldo),
    'Fecha Instalación': c.fecha_instalacion ?? '—',
    'Estado Facturas': c.estado_facturas ?? '—',
    'Router': c.router ?? '—',
  }))
}

function handleExportExcel(clients: BffClient[], estado: string) {
  exportToExcel(buildRows(clients), `clientes-beepyred-${estado.toLowerCase()}`, 'Clientes')
}

function handleExportPDF(clients: BffClient[], estado: string, titleBase: string) {
  exportToPDF(
    `${titleBase} — ${clients.length} registros`,
    PDF_COLUMNS,
    buildRows(clients),
    `clientes-beepyred-${estado.toLowerCase()}`,
    'landscape'
  )
}

export function ClientsDrawer({ estado, onClose }: ClientsDrawerProps) {
  const isOpen = estado !== null
  const { data, isLoading, isError, error } = useClients()
  const [search, setSearch] = useState('')

  const baseClients: BffClient[] = isOpen && data
    ? data.clients.filter((c) => c.estado === estado)
    : []

  const filteredClients = search.trim()
    ? baseClients.filter((c) =>
        c.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : baseClients

  const titleBase = estado === 'Activo'
    ? 'Clientes activos'
    : estado === 'Suspendido'
    ? 'Clientes suspendidos'
    : ''

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-dvh w-[760px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={titleBase}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">{titleBase}</h2>
            <span className="ml-2 inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
              {baseClients.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search + Export row */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-page border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
            />
          </div>
          <button
            onClick={() => handleExportPDF(filteredClients, estado ?? 'activos', titleBase)}
            disabled={filteredClients.length === 0}
            title="Exportar PDF"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-muted hover:text-red-400 hover:bg-red-400/10 border border-border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            onClick={() => handleExportExcel(filteredClients, estado ?? 'activos')}
            disabled={filteredClients.length === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold bg-brand text-black hover:bg-brand-hover transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar base de datos
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="m-6 rounded-xl border border-error/20 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">Error al cargar clientes</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener la lista de clientes'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay clientes en este estado.</p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted w-[60px]">
                    ID
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Nombre
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Plan
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Zona
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Precio/mes
                  </th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Deuda
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Est. Facturas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors duration-150">
                    <td className="px-3 py-3.5 text-xs text-text-muted tabular-nums">
                      {client.id_servicio}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-primary font-medium">
                      {client.nombre}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary truncate max-w-[110px]">
                      {client.plan ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary truncate max-w-[90px]">
                      {abbreviateZona(client.zona) ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-secondary tabular-nums">
                      {client.precio_plan > 0 ? formatCOP(client.precio_plan) : <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-primary tabular-nums font-medium">
                      {formatCOP(client.saldo)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary truncate max-w-[110px]">
                      {client.estado_facturas ?? <span className="text-text-muted italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
