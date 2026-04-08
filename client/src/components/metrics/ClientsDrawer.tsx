import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import type { BffClient } from '@/types/api'

interface ClientsDrawerProps {
  estado: 'Activo' | 'Suspendido' | null  // null = cerrado
  onClose: () => void
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

  const title = estado === 'Activo'
    ? `Clientes activos (${baseClients.length})`
    : estado === 'Suspendido'
    ? `Clientes suspendidos (${baseClients.length})`
    : ''

  return (
    <>
      {/* Overlay — z-40 (debajo del header z-50) */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — z-40, 400px ancho, desliza desde derecha */}
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
        {/* Drawer header */}
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

        {/* Search input */}
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

        {/* Drawer body — scrollable */}
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
              <p className="text-sm text-error">Error al cargar clientes</p>
              <p className="mt-1 text-xs text-text-muted">
                {error?.message ?? 'No se pudo obtener la lista de clientes'}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length === 0 && (
            <div className="p-5">
              <p className="text-sm text-text-muted">No hay clientes en este estado.</p>
            </div>
          )}

          {!isLoading && !isError && filteredClients.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-text-primary font-medium">
                      {client.nombre}
                    </td>
                    <td className="px-3 py-3 text-text-secondary truncate max-w-[100px]">
                      {client.plan ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-3 py-3 text-text-secondary truncate max-w-[80px]">
                      {client.zona ?? <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right text-text-primary tabular-nums">
                      {formatCOP(client.saldo)}
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
