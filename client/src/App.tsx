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
          <div className="hidden sm:block"><LastUpdated /></div>
          <RefreshButton />
          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border mx-1" />
          {/* User badge */}
          <div className="flex items-center gap-2.5 pl-1">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(245,168,0,0.25) 0%, rgba(245,168,0,0.1) 100%)',
                border: '1px solid rgba(245,168,0,0.3)',
                boxShadow: '0 0 12px rgba(245,168,0,0.15)',
              }}
            >
              <span className="text-brand font-bold text-sm leading-none">
                {user.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <p className="text-sm font-semibold text-text-primary leading-none">{user.nombre}</p>
              <p className="text-[10px] text-text-muted mt-0.5 leading-none">Administrador</p>
            </div>
          </div>
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
