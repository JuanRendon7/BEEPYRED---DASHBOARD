import { CompromisosCard } from '@/components/metrics/CompromisosCard'

export function CompromisosView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Compromisos Legales</h2>
        <p className="text-sm text-text-muted mt-1">Obligaciones tributarias y contribuciones anuales BEEPYRED ISP Group SAS</p>
      </div>
      <CompromisosCard />
    </div>
  )
}
