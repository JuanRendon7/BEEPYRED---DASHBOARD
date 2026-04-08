import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const plansRouter = Router()

const CACHE_KEY = 'plans'
const CACHE_TTL_MS = 30_000

interface PlanStat {
  nombre: string
  clientCount: number
  recaudo: number      // suma de precio_plan de todos los clientes en este plan
  avgPrecio: number    // recaudo / clientCount
}

interface PlansData {
  plans: PlanStat[]
  planMasPopular: string | null  // nombre del plan con más clientes
  totalPlanes: number
  totalClientes: number
  totalRecaudo: number
  fetchedAt: string
}

plansRouter.get('/api/plans', async (_req: Request, res: Response) => {
  const cached = cache.get<PlansData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allRaw = await fetchAllPages<unknown>('/api/clientes/')

    const planMap = new Map<string, { clientCount: number; recaudo: number }>()
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (!parsed.success) {
        validationWarnings++
        continue
      }

      // Solo clientes activos o gratis — suspendidos/cancelados no generan recaudo
      const estado = parsed.data.estado
      if (estado !== 'Activo' && estado !== 'Gratis') continue

      const planNombre = parsed.data.plan_internet?.nombre ?? 'Sin plan'
      const precio = parseFloat(parsed.data.precio_plan ?? '0') || 0

      const existing = planMap.get(planNombre) ?? { clientCount: 0, recaudo: 0 }
      planMap.set(planNombre, {
        clientCount: existing.clientCount + 1,
        recaudo: existing.recaudo + precio,
      })
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/plans] ${validationWarnings} client records failed Zod validation`)
    }

    // Build sorted array (by clientCount desc)
    const plans: PlanStat[] = Array.from(planMap.entries())
      .map(([nombre, stats]) => ({
        nombre,
        clientCount: stats.clientCount,
        recaudo: Math.round(stats.recaudo * 100) / 100,
        avgPrecio: stats.clientCount > 0
          ? Math.round((stats.recaudo / stats.clientCount) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.clientCount - a.clientCount)

    const planMasPopular = plans.length > 0 ? plans[0].nombre : null
    const totalClientes = plans.reduce((sum, p) => sum + p.clientCount, 0)
    const totalRecaudo = Math.round(plans.reduce((sum, p) => sum + p.recaudo, 0) * 100) / 100

    const data: PlansData = {
      plans,
      planMasPopular,
      totalPlanes: plans.length,
      totalClientes,
      totalRecaudo,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/plans] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
