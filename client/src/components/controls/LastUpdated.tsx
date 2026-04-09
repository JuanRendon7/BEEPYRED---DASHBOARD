import { useMetrics } from '@/hooks/useMetrics'

function formatTimestamp(ms: number): string | null {
  if (ms === 0) return null

  const fecha = new Date(ms)

  const hoy = new Date()
  const esHoy =
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()

  const hora = fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  if (esHoy) {
    return `Hoy a las ${hora}`
  }

  const fechaStr = fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return `${fechaStr} ${hora}`
}

export function LastUpdated() {
  const { dataUpdatedAt } = useMetrics()
  const label = formatTimestamp(dataUpdatedAt)

  if (!label) return null

  return (
    <p className="text-xs text-text-muted font-medium" aria-live="polite">
      · Última actualización: {label}
    </p>
  )
}
