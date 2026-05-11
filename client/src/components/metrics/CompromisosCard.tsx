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

const MINTIC_PERIODOS = ['1er Trimestre', '2do Trimestre', '3er Trimestre']
const CRC_CUOTAS = ['1ra Cuota', '2da Cuota']

function daysLeft(fecha: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((fecha.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DaysChip({ days }: { days: number }) {
  if (days < 0)
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
        Vencida
      </span>
    )
  if (days <= 15)
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
        {days}d
      </span>
    )
  if (days <= 60)
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
        {days}d
      </span>
    )
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
      {days}d
    </span>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">{title}</p>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>
      <Icon className="h-4 w-4 text-text-muted shrink-0" />
    </div>
  )
}

export function CompromisosCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 space-y-6">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand/10">
          <Calendar className="h-4 w-4 text-brand" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Compromisos Anuales BEEPYRED</p>
          <p className="text-xs text-text-muted">Régimen Simple — Obligaciones tributarias y contribuciones 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* DIAN — Anticipos Bimestrales */}
        <div className="xl:col-span-2">
          <SectionHeader icon={FileText} title="DIAN — Régimen Simple" subtitle="Anticipos bimestrales Industria & Comercio / IVA" />
          <div className="space-y-0">
            {DIAN.map((item) => {
              const days = daysLeft(item.fecha)
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={
                        days < 0
                          ? 'w-1.5 h-1.5 rounded-full bg-white/20 shrink-0'
                          : days <= 15
                          ? 'w-1.5 h-1.5 rounded-full bg-red-400 shrink-0'
                          : days <= 60
                          ? 'w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0'
                          : 'w-1.5 h-1.5 rounded-full bg-green-400 shrink-0'
                      }
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{item.label}</p>
                      <p className="text-[10px] text-text-muted">{item.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <p className="text-xs text-text-secondary hidden sm:block">{formatFecha(item.fecha)}</p>
                    <DaysChip days={days} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Otras obligaciones */}
        <div className="space-y-5">
          {/* MINTIC */}
          <div>
            <SectionHeader icon={Wifi} title="MINTIC 2026" subtitle="Contribución trimestral" />
            <div className="space-y-0">
              {MINTIC_PERIODOS.map((p) => (
                <div key={p} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/50 shrink-0" />
                  <p className="text-xs text-text-secondary">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CRC */}
          <div>
            <SectionHeader icon={RadioTower} title="CRC 2026" subtitle="Contribución regulatoria" />
            <div className="space-y-0">
              {CRC_CUOTAS.map((c) => (
                <div key={c} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/50 shrink-0" />
                  <p className="text-xs text-text-secondary">{c}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cámara de Comercio */}
          <div>
            <SectionHeader icon={Store} title="Cámara de Comercio" subtitle="Obligación anual" />
            <div className="flex items-center gap-2 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand/50 shrink-0" />
              <p className="text-xs text-text-secondary">Renovación Cámara de Comercio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
