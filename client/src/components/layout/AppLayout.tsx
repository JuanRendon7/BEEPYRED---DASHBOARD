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
        <header className="shrink-0 relative px-8 py-0 h-20 flex items-center justify-between border-b border-border bg-page/95 backdrop-blur-xl">
          {/* Bottom accent line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          {/* Subtle top glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Left — page title */}
          <div className="flex flex-col justify-center gap-0.5">
            <h1 className="text-xl font-bold text-text-primary tracking-tight leading-none">{title}</h1>
            {subtitle && (
              <p className="text-xs text-text-muted leading-none mt-1">{subtitle}</p>
            )}
          </div>

          {/* Right — actions */}
          {headerActions && (
            <div className="flex items-center gap-3">
              {headerActions}
            </div>
          )}
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
          <div className="relative z-10 px-8 pt-8 pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
