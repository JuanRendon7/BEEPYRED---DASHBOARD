import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetricsGrid } from '@/components/metrics/MetricsGrid'

function App() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Métricas generales
          </h2>
          <MetricsGrid />
        </section>

        {/* Placeholder para InvoiceList (Plan 04) */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Facturas pendientes
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6">
            <p className="text-text-muted text-sm">
              Lista de facturas — próximo plan
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default App
