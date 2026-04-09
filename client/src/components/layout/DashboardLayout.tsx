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
          {/* Brand section */}
          <div className="flex items-center gap-3">
            <img
              src="/BEEPYRED.JPG"
              alt="BEEPYRED"
              className="h-7 w-auto rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-sm font-bold text-text-primary tracking-tight">
              BEEPYRED
            </span>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-xs text-text-muted font-medium">
              Panel administrativo
            </span>
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
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
