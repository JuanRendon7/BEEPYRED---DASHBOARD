import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const growthRouter = Router()

const CACHE_KEY = 'growth'
const CACHE_TTL_MS = 30_000

interface ClientGrowthPoint {
  month: string        // "2024-03"
  newClients: number
  totalClients: number
}

interface RevenuePoint {
  month: string        // "2024-03"
  revenue: number
  totalRevenue: number
}

interface GrowthData {
  clientGrowth: ClientGrowthPoint[]
  revenueHistory: RevenuePoint[]
  fetchedAt: string
}

growthRouter.get('/api/growth', async (_req: Request, res: Response) => {
  const cached = cache.get<GrowthData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-indexed

    // Fetch clients and invoices in parallel
    const [allClientsRaw, allInvoicesRaw] = await Promise.all([
      fetchAllPages<unknown>('/api/clientes/'),
      fetchAllPages<unknown>('/api/facturas/'),
    ])

    // ── clientGrowth: count new clients per month (by fecha_instalacion) ──
    const newClientsPerMonth = new Map<string, number>()

    for (const raw of allClientsRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success && parsed.data.fecha_instalacion) {
        // Format: "DD/MM/YYYY HH:MM:SS"
        const datePart = parsed.data.fecha_instalacion.split(' ')[0]
        const parts = datePart.split('/')
        if (parts.length === 3) {
          const mm = parts[1], yyyy = parts[2]
          const year = parseInt(yyyy, 10)
          const month = parseInt(mm, 10)
          if (!isNaN(year) && !isNaN(month)) {
            // Exclude current month — only show complete historical months
            if (year === currentYear && month === currentMonth) continue
            const key = `${yyyy}-${mm.padStart(2, '0')}`
            newClientsPerMonth.set(key, (newClientsPerMonth.get(key) ?? 0) + 1)
          }
        }
      }
    }

    // Sort months and calculate running total
    const sortedClientMonths = Array.from(newClientsPerMonth.keys()).sort()
    let runningTotal = 0
    const clientGrowth: ClientGrowthPoint[] = sortedClientMonths.map((month) => {
      const newClients = newClientsPerMonth.get(month) ?? 0
      runningTotal += newClients
      return { month, newClients, totalClients: runningTotal }
    })

    // ── revenueHistory: sum paid invoices per month ──
    const revenuePerMonth = new Map<string, number>()

    for (const raw of allInvoicesRaw.results) {
      const r = raw as any
      const estado: string = r.estado ?? ''
      const fechaPago: string | null = r.fecha_pago ?? null
      const totalCobrado: number = typeof r.total_cobrado === 'number'
        ? r.total_cobrado
        : parseFloat(r.total_cobrado ?? '0')

      if (estado === 'Pagada' && fechaPago) {
        // fechaPago format: "YYYY-MM-DD"
        const [yyyy, mm] = fechaPago.split('-')
        const year = parseInt(yyyy, 10)
        const month = parseInt(mm, 10)
        if (!isNaN(year) && !isNaN(month) && yyyy && mm) {
          // Exclude current month — only show complete historical months
          if (year === currentYear && month === currentMonth) continue
          const key = `${yyyy}-${mm}`
          revenuePerMonth.set(key, (revenuePerMonth.get(key) ?? 0) + totalCobrado)
        }
      }
    }

    // Sort months and calculate running total
    const sortedRevenueMonths = Array.from(revenuePerMonth.keys()).sort()
    let runningRevenue = 0
    const revenueHistory: RevenuePoint[] = sortedRevenueMonths.map((month) => {
      const revenue = revenuePerMonth.get(month) ?? 0
      runningRevenue += revenue
      return {
        month,
        revenue: Math.round(revenue * 100) / 100,
        totalRevenue: Math.round(runningRevenue * 100) / 100,
      }
    })

    const data: GrowthData = {
      clientGrowth,
      revenueHistory,
      fetchedAt: now.toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/growth] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
