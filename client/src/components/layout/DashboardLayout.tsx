import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  headerActions?: ReactNode
}

export function DashboardLayout({ children, headerActions }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      {/* Header — sticky, glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-page/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Brand section — left */}
          <div className="flex items-center gap-3">
            <img
              src="/beepyred-logo.jpg"
              alt="BEEPYRED"
              className="h-8 w-auto rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-text-primary tracking-tight">
                BEEPYRED ISP GROUP SAS
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wide">
                Derechos de autor reservados
              </span>
            </div>
          </div>

          {/* Panel title — center */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <span className="text-base font-bold tracking-widest uppercase text-brand">
              Panel Administrativo
            </span>
            <div className="mt-0.5 h-px w-full bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          </div>

          {/* Right actions */}
          {headerActions && (
            <div className="flex items-center gap-3">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Marca de agua — logo centrado, blend screen elimina el fondo negro */}
        <div
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <img
            src="/beepyred-logo.jpg"
            alt=""
            className="w-[600px] max-w-[70vw] opacity-[0.10]"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
