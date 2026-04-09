import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const moraRouter = Router()

const CACHE_KEY = 'mora'
const CACHE_TTL_MS = 30_000

interface MoraClient {
  nombre: string
  totalMora: number       // suma de total_cobrado de facturas vencidas
  diasMaxAtraso: number   // máximo días de atraso entre sus facturas vencidas
  facturaCount: number    // número de facturas vencidas
}

interface MoraData {
  clientesEnMora: MoraClient[]
  totalClientesEnMora: number
  totalMontoMora: number
  fetchedAt: string
}

moraRouter.get('/api/mora', async (_req: Request, res: Response) => {
  const cached = cache.get<MoraData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    // Fetch clientes + facturas en paralelo
    const [allClientsRaw, allInvoicesRaw] = await Promise.all([
      fetchAllPages<unknown>('/api/clientes/'),
      fetchAllPages<unknown>('/api/facturas/'),
    ])

    // Build id_servicio → nombre map from validated clients
    const clientNames = new Map<number, string>()
    for (const raw of allClientsRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success) {
        clientNames.set(parsed.data.id_servicio, parsed.data.nombre)
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Group overdue invoices by id_servicio
    // Overdue = estado "Pendiente de Pago" AND fecha_vencimiento < today
    const moraMap = new Map<number, { nombre: string; totalMora: number; diasMaxAtraso: number; facturaCount: number }>()

    for (const raw of allInvoicesRaw.results) {
      const r = raw as any
      if (r.estado !== 'Pendiente de Pago') continue

      // Parse fecha_vencimiento — Wisphub returns ISO date string "YYYY-MM-DD"
      const fechaVencStr: string | undefined = r.fecha_vencimiento
      if (!fechaVencStr) continue

      const [yearStr, monthStr, dayStr] = fechaVencStr.split('T')[0].split('-')
      const fechaVenc = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))
      fechaVenc.setHours(0, 0, 0, 0)

      if (fechaVenc >= today) continue  // Not yet overdue

      const diasAtraso = Math.floor((today.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))

      const monto = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
      if (!monto || monto <= 0) continue

      const idServicio: number | undefined = r.articulos?.[0]?.servicio?.id_servicio
      if (typeof idServicio !== 'number') continue

      const nombre = clientNames.get(idServicio) ?? `Cliente #${idServicio}`
      const existing = moraMap.get(idServicio)

      if (existing) {
        existing.totalMora += monto
        existing.diasMaxAtraso = Math.max(existing.diasMaxAtraso, diasAtraso)
        existing.facturaCount += 1
      } else {
        moraMap.set(idServicio, {
          nombre,
          totalMora: monto,
          diasMaxAtraso: diasAtraso,
          facturaCount: 1,
        })
      }
    }

    // Build sorted array (by diasMaxAtraso desc)
    const clientesEnMora: MoraClient[] = Array.from(moraMap.values())
      .map(c => ({
        nombre: c.nombre,
        totalMora: Math.round(c.totalMora * 100) / 100,
        diasMaxAtraso: c.diasMaxAtraso,
        facturaCount: c.facturaCount,
      }))
      .sort((a, b) => b.diasMaxAtraso - a.diasMaxAtraso)

    const totalMontoMora = Math.round(
      clientesEnMora.reduce((sum, c) => sum + c.totalMora, 0) * 100
    ) / 100

    const data: MoraData = {
      clientesEnMora,
      totalClientesEnMora: clientesEnMora.length,
      totalMontoMora,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/mora] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
