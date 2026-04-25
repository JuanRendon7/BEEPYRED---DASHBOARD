import { LayoutDashboard, DollarSign, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavSection = 'dashboard' | 'financiero' | 'usuarios' | 'crecimiento'

const navItems = [
  { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard, desc: 'Vista general' },
  { id: 'financiero' as NavSection, label: 'Financiero', icon: DollarSign, desc: 'Ingresos y deuda' },
  { id: 'usuarios' as NavSection, label: 'Usuarios', icon: Users, desc: 'Clientes y planes' },
  { id: 'crecimiento' as NavSection, label: 'Crecimiento', icon: TrendingUp, desc: 'Evolución histórica' },
]

interface SidebarProps {
  active: NavSection
  onNavigate: (s: NavSection) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col w-60 h-screen bg-surface border-r border-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="relative">
          <img
            src="/beepyred-logo.jpg"
            alt="BEEPYRED"
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-brand/20"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary tracking-tight leading-tight">BEEPYRED</p>
          <p className="text-[10px] text-brand font-semibold tracking-widest uppercase">ISP Group SAS</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted/60">Módulos</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group',
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/25'
                  : 'text-text-secondary border border-transparent hover:bg-white/5 hover:text-text-primary hover:border-white/8'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
                isActive ? 'bg-brand/20' : 'bg-white/5 group-hover:bg-white/10'
              )}>
                <item.icon className={cn('h-4 w-4', isActive ? 'text-brand' : '')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold leading-none', isActive ? 'text-brand' : '')}>{item.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] text-text-muted">Wisphub API conectado</p>
        </div>
        <p className="text-[10px] text-text-muted/40">© 2025 BEEPYRED ISP GROUP SAS</p>
      </div>
    </aside>
  )
}
