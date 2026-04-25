import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  title: string
  subtitle?: string
  headerActions?: ReactNode
}

export function AppLayout({ sidebar, children, title, subtitle, headerActions }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 h-16 border-b border-border bg-page/90 backdrop-blur-xl shrink-0 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent" />
          <div>
            <h1 className="text-base font-bold text-text-primary tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto relative">
          <div
            className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <img
              src="/beepyred-logo.jpg"
              alt=""
              className="w-[480px] max-w-[55vw] opacity-[0.03]"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          <div className="relative z-10 p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
