import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetricsGrid } from '@/components/metrics/MetricsGrid'
import { InvoiceList } from '@/components/invoices/InvoiceList'
import { RefreshButton } from '@/components/controls/RefreshButton'
import { LastUpdated } from '@/components/controls/LastUpdated'

function App() {
  return (
    <DashboardLayout
      headerActions={
        <>
          <LastUpdated />
          <RefreshButton />
        </>
      }
    >
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Métricas generales
          </h2>
          <MetricsGrid />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Facturas pendientes
          </h2>
          <InvoiceList />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default App
