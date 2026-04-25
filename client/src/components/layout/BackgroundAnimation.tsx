import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  orbitStrength: number
}

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PARTICLE_COUNT = 55
    const MAX_DIST = 160
    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Load logo image
    const logo = new Image()
    logo.src = '/beepyred-logo.jpg'

    // Init particles — distributed across screen with slight center bias
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const spread = 0.3 + Math.random() * 0.7
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const px = cx + (Math.random() - 0.5) * canvas.width * spread
      const py = cy + (Math.random() - 0.5) * canvas.height * spread

      particles.push({
        x: Math.max(0, Math.min(canvas.width, px)),
        y: Math.max(0, Math.min(canvas.height, py)),
        vx: Math.cos(angle) * (0.15 + Math.random() * 0.25),
        vy: Math.sin(angle) * (0.15 + Math.random() * 0.25),
        radius: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.35 + 0.15,
        orbitStrength: Math.random() * 0.00008,
      })
    }

    let animId: number
    let tick = 0

    function draw() {
      if (!canvas || !ctx) return
      tick++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Draw logo centered with glow
      if (logo.complete && logo.naturalWidth > 0) {
        const size = Math.min(canvas.width * 0.38, 420)
        ctx.save()
        ctx.globalAlpha = 0.055
        ctx.filter = 'blur(0px)'

        // Soft golden glow behind logo
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.7)
        grd.addColorStop(0, 'rgba(245, 168, 0, 0.07)')
        grd.addColorStop(1, 'rgba(245, 168, 0, 0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(cx, cy, size * 0.7, 0, Math.PI * 2)
        ctx.fill()

        // Logo image
        ctx.globalAlpha = 0.06
        ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size)
        ctx.restore()
      }

      // Gentle orbit pull toward center
      for (const p of particles) {
        const dx = cx - p.x
        const dy = cy - p.y
        p.vx += dx * p.orbitStrength
        p.vy += dy * p.orbitStrength

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 0.5) {
          p.vx = (p.vx / speed) * 0.5
          p.vy = (p.vy / speed) * 0.5
        }

        p.x += p.vx
        p.y += p.vy

        // Soft bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Subtle pulse opacity
        const pulsedOpacity = p.opacity * (0.85 + 0.15 * Math.sin(tick * 0.02 + p.x))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 168, 0, ${pulsedOpacity})`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(245, 168, 0, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-0"
      aria-hidden="true"
    />
  )
}
