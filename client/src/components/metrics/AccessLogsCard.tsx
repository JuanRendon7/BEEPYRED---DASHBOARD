import { Shield } from 'lucide-react'

interface LogEntry {
  nombre: string
  timestamp: string
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatEntry(ts: string) {
  const d = new Date(ts)
  const day = DAYS[d.getDay()]
  const date = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  return { day, date, time }
}

export function AccessLogsCard() {
  const raw = localStorage.getItem('beepyred_access_logs') ?? '[]'
  const logs: LogEntry[] = JSON.parse(raw)

  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Accesos recientes</p>
          <p className="text-xs text-text-muted mt-0.5">Historial de ingresos al sistema</p>
        </div>
        <Shield className="h-4 w-4 text-text-muted" />
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">Sin registros aún</p>
      ) : (
        <div className="space-y-1">
          {logs.slice(0, 10).map((entry, i) => {
            const { day, date, time } = formatEntry(entry.timestamp)
            return (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <p className="text-xs font-medium text-text-primary truncate">{entry.nombre}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-text-secondary">{time} · {day}</p>
                  <p className="text-[10px] text-text-muted">{date}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
