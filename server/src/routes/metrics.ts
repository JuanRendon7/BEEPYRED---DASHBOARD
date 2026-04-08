import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema, WisphubInvoiceSchema } from '../lib/schemas'
import { cache } from '../lib/cache'
import { z } from 'zod'

export const metricsRouter = Router()

const CACHE_KEY = 'metrics'
const CACHE_TTL_MS = 30_000  // 30 seconds

interface MetricsData {
  activeClients: number
  suspendedClients: number       // Clients with estado === 'Suspendido'
  pendingDebt: number            // Sum of saldo across all active clients with saldo > 0
  monthlyRevenue: number         // Sum of total_cobrado for paid invoices this month
  fetchedAt: string
}

metricsRouter.get('/api/metrics', async (_req: Request, res: Response) => {
  // Check cache first — prevents hammering Wisphub on repeated requests
  const cached = cache.get<MetricsData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    // ── Step 1: Fetch ALL clients (estado=Activo filter does NOT work — 02-api-shapes.md) ──
    const allClientsRaw = await fetchAllPages<unknown>('/api/clientes/')

    // Validate and filter clients server-side
    const activeClients: z.infer<typeof WisphubClientSchema>[] = []
    let suspendedClients = 0
    let validationWarnings = 0

    for (const raw of allClientsRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success) {
        if (parsed.data.estado === 'Activo') {
          activeClients.push(parsed.data)
        } else if (parsed.data.estado === 'Suspendido') {
          suspendedClients++
        }
      } else {
        validationWarnings++
      }
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/metrics] ${validationWarnings} client records failed Zod validation`)
    }

    // ── MET-03: Pending debt — sum of saldo from ALL clients with saldo > 0 ──
    // saldo is a STRING in client records ("0.00") — confirmed in 02-api-shapes.md
    const pendingDebt = allClientsRaw.results
      .map((raw) => {
        const parsed = WisphubClientSchema.safeParse(raw)
        if (!parsed.success) return 0
        return parseFloat(parsed.data.saldo) || 0
      })
      .filter((saldo) => saldo > 0)
      .reduce((sum, saldo) => sum + saldo, 0)

    // ── MET-04: Monthly revenue — paid invoices in current month ──
    // Filter server-side: estado === 'Pagada' + fecha_pago in current month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')

    let monthlyRevenue = 0
    let invoiceValidationWarnings = 0

    for (const raw of allInvoicesRaw.results) {
      const parsed = WisphubInvoiceSchema.safeParse(raw)
      if (!parsed.success) {
        invoiceValidationWarnings++
        continue
      }

      const inv = parsed.data
      if (inv.estado === 'Pagada' && inv.fecha_pago !== null) {
        const paidDate = new Date(inv.fecha_pago)
        if (
          paidDate.getFullYear() === currentYear &&
          paidDate.getMonth() === currentMonth
        ) {
          monthlyRevenue += inv.total_cobrado
        }
      }
    }

    if (invoiceValidationWarnings > 0) {
      console.warn(`[/api/metrics] ${invoiceValidationWarnings} invoice records failed Zod validation`)
    }

    const data: MetricsData = {
      activeClients: activeClients.length,
      suspendedClients,
      pendingDebt: Math.round(pendingDebt * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      fetchedAt: now.toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/metrics] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
