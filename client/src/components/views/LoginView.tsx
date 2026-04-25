import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// ── Particle network animation ──────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

function useNetworkCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PARTICLE_COUNT = 80
    const MAX_DIST = 140
    const BRAND = '#F5A800'
    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    let animId: number

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 168, 0, ${p.opacity})`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(245, 168, 0, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Occasional "pulse" node — hexagon shape (honeycomb nod)
      animId = requestAnimationFrame(draw)
    }

    // Suppress unused warning
    void BRAND
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [canvasRef])
}

// ── Login form ───────────────────────────────────────────────────────────────

export function LoginView() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useNetworkCanvas(canvasRef)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(username, password)
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-page flex items-center justify-center p-4 overflow-hidden">

      {/* Animated network background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.9 }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,168,0,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-brand/30"
              style={{
                background: 'linear-gradient(135deg, rgba(245,168,0,0.15) 0%, rgba(245,168,0,0.05) 100%)',
                boxShadow: '0 0 32px rgba(245,168,0,0.2), inset 0 1px 0 rgba(245,168,0,0.15)',
              }}
            >
              <span className="text-brand font-black text-2xl tracking-tighter">B</span>
            </div>
            <div>
              <h1
                className="text-3xl font-black tracking-widest"
                style={{
                  background: 'linear-gradient(90deg, #F5A800 0%, #FFD166 50%, #F5A800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                BEEPYRED
              </h1>
              <p className="text-xs text-text-muted tracking-[0.3em] uppercase mt-0.5">ISP Group SAS</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-border p-6 space-y-5"
          style={{
            background: 'rgba(24, 24, 27, 0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,168,0,0.08)',
          }}
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">Iniciar sesión</p>
            <p className="text-xs text-text-muted mt-0.5">Panel de administración</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-muted" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center bg-red-400/5 border border-red-400/20 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold text-sm py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-1"
              style={{
                background: isLoading
                  ? 'rgba(245,168,0,0.5)'
                  : 'linear-gradient(135deg, #F5A800 0%, #FFB800 100%)',
                color: '#0A0A0A',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(245,168,0,0.3)',
              }}
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-text-muted/40 mt-5 tracking-widest uppercase">
          Acceso restringido · © 2025 BEEPYRED
        </p>
      </div>
    </div>
  )
}
