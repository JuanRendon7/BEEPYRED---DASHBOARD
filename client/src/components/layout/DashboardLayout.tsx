import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  headerActions?: ReactNode
}

export function DashboardLayout({ children, headerActions }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      {/* Header — sticky per D-09 */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/BEEPYRED.JPG"
              alt="BEEPYRED"
              className="h-8 w-auto rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <h1 className="text-lg font-semibold text-text-primary">
                BEEPYRED Dashboard
              </h1>
              <p className="text-xs text-text-muted">Panel de administración</p>
            </div>
          </div>
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
