import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInstalledClients } from '@/hooks/useInstalledClients'

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

  const title = `Instalados este mes (${baseClients.length})`

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
          'fixed top-0 right-0 z-40 h-full w-[600px] max-w-[95vw]',
          'bg-surface border-l border-border',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-page border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="p-5">
              <p className="text-sm text-error">Error al cargar datos</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener la lista'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay clientes instalados este mes.</p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cliente</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Plan</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Zona</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Fecha alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-text-primary font-medium">{client.nombre}</td>
                    <td className="px-3 py-3 text-text-secondary truncate max-w-[100px]">
                      {client.plan ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3 text-text-secondary truncate max-w-[80px]">
                      {abbreviateZona(client.zona) ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary tabular-nums">
                      {formatFecha(client.fechaAlta)}
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
