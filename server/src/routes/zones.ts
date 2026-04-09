import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const zonesRouter = Router()

const CACHE_KEY = 'zones'
const CACHE_TTL_MS = 30_000

interface ZoneStat {
  nombre: string
  clientCount: number
  recaudo: number     // suma de precio_plan de clientes activos/gratis en esta zona
  avgPrecio: number   // recaudo / clientCount
}

interface ZonesData {
  zones: ZoneStat[]
  totalZonas: number
  totalClientes: number
  zonaConMasClientes: string | null
  fetchedAt: string
}

zonesRouter.get('/api/zones', async (_req: Request, res: Response) => {
  const cached = cache.get<ZonesData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allRaw = await fetchAllPages<unknown>('/api/clientes/')

    const zoneMap = new Map<string, { clientCount: number; recaudo: number }>()
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (!parsed.success) {
        validationWarnings++
        continue
      }

      // Solo clientes activos o gratis
      const estado = parsed.data.estado
      if (estado !== 'Activo' && estado !== 'Gratis') continue

      const zonaNombre = parsed.data.zona?.nombre ?? 'Sin zona'
      const precio = parseFloat(parsed.data.precio_plan ?? '0') || 0

      const existing = zoneMap.get(zonaNombre) ?? { clientCount: 0, recaudo: 0 }
      zoneMap.set(zonaNombre, {
        clientCount: existing.clientCount + 1,
        recaudo: existing.recaudo + precio,
      })
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/zones] ${validationWarnings} client records failed Zod validation`)
    }

    // Build sorted array (by clientCount desc)
    const zones: ZoneStat[] = Array.from(zoneMap.entries())
      .map(([nombre, stats]) => ({
        nombre,
        clientCount: stats.clientCount,
        recaudo: Math.round(stats.recaudo * 100) / 100,
        avgPrecio: stats.clientCount > 0
          ? Math.round((stats.recaudo / stats.clientCount) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.clientCount - a.clientCount)

    const zonaConMasClientes = zones.length > 0 ? zones[0].nombre : null
    const totalClientes = zones.reduce((sum, z) => sum + z.clientCount, 0)

    const data: ZonesData = {
      zones,
      totalZonas: zones.length,
      totalClientes,
      zonaConMasClientes,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/zones] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
