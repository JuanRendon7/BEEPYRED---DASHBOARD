import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const antiguedadRouter = Router()

const CACHE_KEY = 'antiguedad'
const CACHE_TTL_MS = 30_000

interface AntiguedadDistribution {
  menosDe6Meses: number   // < 180 días
  de6A12Meses: number     // 180–364 días
  de1A2Anos: number       // 365–729 días
  masDe2Anos: number      // >= 730 días
}

interface AntiguedadData {
  avgDays: number
  avgLabel: string                    // e.g. "1 año 3 meses"
  distribution: AntiguedadDistribution
  totalClientes: number
  fetchedAt: string
}

/** Convert average days to a human-readable label */
function buildAvgLabel(days: number): string {
  if (days < 30) return `${Math.round(days)} días`
  if (days < 365) {
    const months = Math.round(days / 30)
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  const years = Math.floor(days / 365)
  const remainingMonths = Math.round((days % 365) / 30)
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`
  return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`
}

antiguedadRouter.get('/api/antiguedad', async (_req: Request, res: Response) => {
  const cached = cache.get<AntiguedadData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allRaw = await fetchAllPages<unknown>('/api/clientes/')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const distribution: AntiguedadDistribution = {
      menosDe6Meses: 0,
      de6A12Meses: 0,
      de1A2Anos: 0,
      masDe2Anos: 0,
    }

    let totalDays = 0
    let totalClientes = 0
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (!parsed.success) {
        validationWarnings++
        continue
      }

      // Solo clientes activos o gratis con fecha_instalacion
      const estado = parsed.data.estado
      if (estado !== 'Activo' && estado !== 'Gratis') continue
      if (!parsed.data.fecha_instalacion) continue

      // Format: "DD/MM/YYYY HH:MM:SS" — reusing parser pattern from clients.ts lines 142-143
      const datePart = parsed.data.fecha_instalacion.split(' ')[0]
      const [dayStr, monthStr, yearStr] = datePart.split('/')
      const day = Number(dayStr), month = Number(monthStr), year = Number(yearStr)
      if (isNaN(day) || isNaN(month) || isNaN(year)) continue

      const fechaInstalacion = new Date(year, month - 1, day)
      fechaInstalacion.setHours(0, 0, 0, 0)

      const days = Math.floor((today.getTime() - fechaInstalacion.getTime()) / (1000 * 60 * 60 * 24))
      if (days < 0) continue  // Future date — skip (data anomaly)

      totalDays += days
      totalClientes += 1

      if (days < 180) {
        distribution.menosDe6Meses += 1
      } else if (days < 365) {
        distribution.de6A12Meses += 1
      } else if (days < 730) {
        distribution.de1A2Anos += 1
      } else {
        distribution.masDe2Anos += 1
      }
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/antiguedad] ${validationWarnings} client records failed Zod validation`)
    }

    const avgDays = totalClientes > 0 ? Math.round(totalDays / totalClientes) : 0
    const avgLabel = totalClientes > 0 ? buildAvgLabel(avgDays) : 'Sin datos'

    const data: AntiguedadData = {
      avgDays,
      avgLabel,
      distribution,
      totalClientes,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/antiguedad] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
