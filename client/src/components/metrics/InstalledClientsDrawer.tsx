import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInstalledClients } from '@/hooks/useInstalledClients'
import { ExportButtons } from '@/components/ui/ExportButtons'
import { exportToExcel, exportToPDF } from '@/lib/export'

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface InstalledClientsDrawerProps {
  isOpen: boolean
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

function formatFecha(fecha: string): string {
  // Format from Wisphub: "DD/MM/YYYY HH:MM:SS" — take only the date part
  return fecha.split(' ')[0]
}

export function InstalledClientsDrawer({ isOpen, onClose }: InstalledClientsDrawerProps) {
  const { data, isLoading, isError, error } = useInstalledClients()
  const [search, setSearch] = useState('')

  const baseClients = isOpen && data ? data.clients : []
  const filteredClients = search.trim()
    ? baseClients.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()))
    : baseClients

  const title = 'Instalados este mes'

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
          'fixed top-0 right-0 z-40 h-full w-[520px] max-w-[95vw]',
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
          <div className="flex items-center">
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
            <span className="ml-2 inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium text-text-muted ring-1 ring-inset ring-white/10">
              {baseClients.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons
              disabled={baseClients.length === 0}
              onExcel={() => exportToExcel(
                baseClients.map(c => ({ Cliente: c.nombre, Plan: c.plan ?? '—', Zona: c.zona ?? '—', 'Valor/mes': c.precioPlan, 'Fecha alta': c.fechaAlta.split(' ')[0] })),
                'instalados_mes_beepyred', 'Instalados'
              )}
              onPDF={() => exportToPDF('Instalados este mes', [
                { header: 'Cliente', dataKey: 'Cliente' },
                { header: 'Plan', dataKey: 'Plan' },
                { header: 'Zona', dataKey: 'Zona' },
                { header: 'Valor/mes', dataKey: 'Valor' },
                { header: 'Fecha alta', dataKey: 'Fecha' },
              ], baseClients.map(c => ({ Cliente: c.nombre, Plan: c.plan ?? '—', Zona: c.zona ?? '—', Valor: `$${c.precioPlan.toLocaleString('es-CO')}`, Fecha: c.fechaAlta.split(' ')[0] })),
              'instalados_mes_beepyred')}
            />
            <button onClick={onClose} className="rounded-xl p-2 text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors duration-200" aria-label="Cerrar panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-page border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Body */}
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
              <p className="text-sm font-semibold text-error">Error al cargar datos</p>
              <p className="text-xs text-text-muted mt-1">
                {error?.message ?? 'No se pudo obtener la lista'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm text-text-muted">No hay clientes instalados este mes.</p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Cliente</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Plan</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-text-muted">Zona</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Valor/mes</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted">Fecha alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors duration-150">
                    <td className="px-6 py-3.5 text-sm text-text-primary font-medium">{client.nombre}</td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary truncate max-w-[100px]">
                      {client.plan ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary truncate max-w-[80px]">
                      {abbreviateZona(client.zona) ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-sm text-text-secondary tabular-nums font-medium">
                      {formatCOP(client.precioPlan)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-text-muted tabular-nums">
                      {formatFecha(client.fechaAlta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — total recaudo nuevos clientes */}
        {!isLoading && !isError && data && data.totalRevenue > 0 && (
          <div className="flex-shrink-0 border-t border-border bg-page/40 px-6 py-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Recaudo mensual nuevos clientes
            </span>
            <span className="text-sm font-bold text-brand tabular-nums">
              {formatCOP(data.totalRevenue)}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
