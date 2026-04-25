import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Sidebar, type NavSection } from '@/components/layout/Sidebar'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardView } from '@/components/views/DashboardView'
import { FinancieroView } from '@/components/views/FinancieroView'
import { UsuariosView } from '@/components/views/UsuariosView'
import { CrecimientoView } from '@/components/views/CrecimientoView'
import { LoginView } from '@/components/views/LoginView'
import { RefreshButton } from '@/components/controls/RefreshButton'
import { LastUpdated } from '@/components/controls/LastUpdated'

const sectionMeta: Record<NavSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen ejecutivo de BEEPYRED ISP' },
  financiero: { title: 'Financiero', subtitle: 'Ingresos, recaudo y estado de cartera' },
  usuarios: { title: 'Usuarios', subtitle: 'Clientes, zonas y distribución de planes' },
  crecimiento: { title: 'Crecimiento', subtitle: 'Evolución histórica e instalaciones' },
}

function AppInner() {
  const { user, isLoading } = useAuth()
  const [section, setSection] = useState<NavSection>('dashboard')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginView />

  const meta = sectionMeta[section]

  return (
    <AppLayout
      sidebar={<Sidebar active={section} onNavigate={setSection} />}
      title={meta.title}
      subtitle={meta.subtitle}
      headerActions={
        <>
          <LastUpdated />
          <RefreshButton />
        </>
      }
    >
      {section === 'dashboard' && <DashboardView />}
      {section === 'financiero' && <FinancieroView />}
      {section === 'usuarios' && <UsuariosView />}
      {section === 'crecimiento' && <CrecimientoView />}
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
