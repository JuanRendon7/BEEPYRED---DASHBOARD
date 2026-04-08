import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetricsGrid } from '@/components/metrics/MetricsGrid'
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
      <MetricsGrid />
    </DashboardLayout>
  )
}

export default App
