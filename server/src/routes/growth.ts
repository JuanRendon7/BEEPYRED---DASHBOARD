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

    // Fetch only clients — invoices only have recent data, not historical
    const allClientsRaw = await fetchAllPages<unknown>('/api/clientes/')

    // ── Parse each client: extract install month + monthly plan price ──
    interface ClientRecord {
      installKey: string  // "YYYY-MM"
      precioPlan: number
    }
    const clientRecords: ClientRecord[] = []

    for (const raw of allClientsRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (!parsed.success || !parsed.data.fecha_instalacion) continue

      // Format: "DD/MM/YYYY HH:MM:SS"
      const datePart = parsed.data.fecha_instalacion.split(' ')[0]
      const parts = datePart.split('/')
      if (parts.length !== 3) continue
      const mm = parts[1], yyyy = parts[2]
      const year = parseInt(yyyy, 10), month = parseInt(mm, 10)
      if (isNaN(year) || isNaN(month)) continue
      // Exclude current month — only complete historical months
      if (year === currentYear && month === currentMonth) continue

      const precioPlan = parseFloat(parsed.data.precio_plan ?? '0') || 0
      clientRecords.push({ installKey: `${yyyy}-${mm.padStart(2, '0')}`, precioPlan })
    }

    // ── clientGrowth: count new clients per month ──
    const newClientsPerMonth = new Map<string, number>()
    for (const { installKey } of clientRecords) {
      newClientsPerMonth.set(installKey, (newClientsPerMonth.get(installKey) ?? 0) + 1)
    }

    const sortedClientMonths = Array.from(newClientsPerMonth.keys()).sort()
    let runningTotal = 0
    const clientGrowth: ClientGrowthPoint[] = sortedClientMonths.map((month) => {
      const newClients = newClientsPerMonth.get(month) ?? 0
      runningTotal += newClients
      return { month, newClients, totalClients: runningTotal }
    })

    // ── revenueHistory: MRR per month = sum of precio_plan of clients active that month ──
    // A client is "active" in a given month if their install month <= that month.
    // This reconstructs historical MRR from client data since Wisphub only returns recent invoices.
    const allMonths = sortedClientMonths  // already sorted ascending
    const revenuePerMonth = new Map<string, number>()

    for (const month of allMonths) {
      // Clients active this month = all clients installed up to and including this month
      const activeRevenue = clientRecords
        .filter(c => c.installKey <= month)
        .reduce((sum, c) => sum + c.precioPlan, 0)
      revenuePerMonth.set(month, activeRevenue)
    }

    let runningRevenue = 0
    const revenueHistory: RevenuePoint[] = allMonths.map((month) => {
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
