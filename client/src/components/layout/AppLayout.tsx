import { useState, useEffect, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { BackgroundAnimation } from './BackgroundAnimation'

interface AppLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  title: string
  subtitle?: string
  headerActions?: ReactNode
}

export function AppLayout({ sidebar, children, title, subtitle, headerActions }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on section change
  useEffect(() => {
    setMobileOpen(false)
  }, [title])

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-10">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="shrink-0 relative px-4 md:px-8 py-0 h-16 md:h-20 flex items-center justify-between border-b border-border bg-page/95 backdrop-blur-xl">
          {/* Bottom accent line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          {/* Subtle top glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Left — hamburger (mobile) + page title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors shrink-0"
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex flex-col justify-center gap-0.5 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-text-primary tracking-tight leading-none truncate">{title}</h1>
              {subtitle && (
                <p className="hidden sm:block text-xs text-text-muted leading-none mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right — actions */}
          {headerActions && (
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {headerActions}
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto relative">
          <BackgroundAnimation />
          <div className="relative z-10 px-4 md:px-8 pt-5 md:pt-8 pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
