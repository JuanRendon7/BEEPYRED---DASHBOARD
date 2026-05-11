import { Calendar, FileText, Wifi, RadioTower, Store } from 'lucide-react'

interface Obligacion {
  label: string
  descripcion: string
  fecha: Date
}

const DIAN: Obligacion[] = [
  { label: 'Declaración Anual Consolidada', descripcion: 'Año gravable 2025', fecha: new Date(2026, 3, 23) },
  { label: 'Anticipo Ene – Feb', descripcion: 'Anticipo bimestral 1/6', fecha: new Date(2026, 4, 21) },
  { label: 'Información Exógena', descripcion: 'Año gravable 2025', fecha: new Date(2026, 5, 12) },
  { label: 'Anticipo Mar – Abr', descripcion: 'Anticipo bimestral 2/6', fecha: new Date(2026, 5, 19) },
  { label: 'Anticipo May – Jun', descripcion: 'Anticipo bimestral 3/6', fecha: new Date(2026, 6, 17) },
  { label: 'Anticipo Jul – Ago', descripcion: 'Anticipo bimestral 4/6', fecha: new Date(2026, 8, 17) },
  { label: 'Anticipo Sep – Oct', descripcion: 'Anticipo bimestral 5/6', fecha: new Date(2026, 10, 20) },
  { label: 'Anticipo Nov – Dic', descripcion: 'Anticipo bimestral 6/6', fecha: new Date(2027, 0, 21) },
]

const MINTIC: Obligacion[] = [
  { label: '1er Trimestre', descripcion: 'Contribución MINTIC', fecha: new Date(2026, 3, 30) },
  { label: '2do Trimestre', descripcion: 'Contribución MINTIC', fecha: new Date(2026, 6, 30) },
  { label: '3er Trimestre', descripcion: 'Contribución MINTIC', fecha: new Date(2026, 9, 30) },
  { label: '4to Trimestre', descripcion: 'Contribución MINTIC', fecha: new Date(2027, 0, 30) },
]

const CRC: Obligacion[] = [
  { label: '1ra Cuota', descripcion: 'Contribución CRC', fecha: new Date(2026, 0, 30) },
  { label: '2da Cuota', descripcion: 'Contribución CRC', fecha: new Date(2026, 6, 30) },
]

function daysLeft(fecha: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((fecha.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function dotColor(days: number): string {
  if (days < 0) return 'bg-white/20'
  if (days <= 15) return 'bg-red-400'
  if (days <= 60) return 'bg-yellow-400'
  return 'bg-green-400'
}

function DaysChip({ days }: { days: number }) {
  if (days < 0)
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-text-muted">Vencida</span>
  if (days <= 15)
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">{days}d</span>
  if (days <= 60)
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">{days}d</span>
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{days}d</span>
}

export function CompromisosCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand/10 shrink-0">
          <Calendar className="h-4 w-4 text-brand" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Compromisos Anuales</p>
          <p className="text-xs text-text-muted mt-0.5">Régimen Simple 2026</p>
        </div>
      </div>

      {/* DIAN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">DIAN</p>
            <p className="text-xs text-text-muted mt-0.5">Anticipos bimestrales I&C / IVA</p>
          </div>
          <FileText className="h-4 w-4 text-text-muted shrink-0" />
        </div>
        <div>
          {DIAN.map((item) => {
            const days = daysLeft(item.fecha)
            return (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(days)}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{item.label}</p>
                    <p className="text-[10px] text-text-muted">{formatFecha(item.fecha)}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <DaysChip days={days} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MINTIC */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">MINTIC 2026</p>
            <p className="text-xs text-text-muted mt-0.5">Contribución trimestral</p>
          </div>
          <Wifi className="h-4 w-4 text-text-muted shrink-0" />
        </div>
        <div>
          {MINTIC.map((item) => {
            const days = daysLeft(item.fecha)
            return (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(days)}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{item.label}</p>
                    <p className="text-[10px] text-text-muted">{formatFecha(item.fecha)}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <DaysChip days={days} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CRC */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">CRC 2026</p>
            <p className="text-xs text-text-muted mt-0.5">Contribución regulatoria</p>
          </div>
          <RadioTower className="h-4 w-4 text-text-muted shrink-0" />
        </div>
        <div>
          {CRC.map((item) => {
            const days = daysLeft(item.fecha)
            return (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(days)}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{item.label}</p>
                    <p className="text-[10px] text-text-muted">{formatFecha(item.fecha)}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <DaysChip days={days} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cámara de Comercio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Cámara de Comercio</p>
            <p className="text-xs text-text-muted mt-0.5">Obligación anual</p>
          </div>
          <Store className="h-4 w-4 text-text-muted shrink-0" />
        </div>
        <div className="flex items-center gap-2 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0" />
          <p className="text-xs text-text-secondary">Renovación Cámara de Comercio</p>
        </div>
      </div>

    </div>
  )
}
