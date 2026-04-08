import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const clientsRouter = Router()

const CACHE_KEY = 'clients'
const INSTALLED_CACHE_KEY = 'clients:installed-this-month'
const CACHE_TTL_MS = 30_000

interface BffClientRecord {
  nombre: string
  estado: string
  saldo: number          // suma de saldos de facturas pendientes/vencidas del cliente
  plan: string | null    // plan_internet.nombre o null
  zona: string | null    // zona.nombre o null
}

interface ClientsData {
  clients: BffClientRecord[]
  totalCount: number
  fetchedAt: string
}

interface InstalledClientRecord {
  nombre: string
  plan: string | null
  zona: string | null
  fechaAlta: string   // ISO date string "YYYY-MM-DD"
}

interface InstalledClientsData {
  clients: InstalledClientRecord[]
  totalCount: number
  month: number       // 1-indexed
  year: number
  fetchedAt: string
}

clientsRouter.get('/api/clients', async (_req: Request, res: Response) => {
  // Check cache first — prevents hammering Wisphub on repeated requests
  const cached = cache.get<ClientsData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    // Fetch clientes + TODAS las facturas en paralelo (filtro por estado no funciona en Wisphub)
    const [allRaw, allInvoicesRaw] = await Promise.all([
      fetchAllPages<unknown>('/api/clientes/'),
      fetchAllPages<unknown>('/api/facturas/'),
    ])

    // Mapa id_servicio → deuda usando articulos[0].servicio.id_servicio
    // Se accede via casteo (any) para evitar problemas de validación Zod en campos internos
    const debtById = new Map<number, number>()
    for (const raw of allInvoicesRaw.results) {
      const r = raw as any
      // Solo "Pendiente de Pago" — en Wisphub saldo=0 pero total_cobrado tiene el monto prometido
      if (r.estado !== 'Pendiente de Pago') continue
      const monto = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
      if (!monto || monto <= 0) continue
      const idServicio = r.articulos?.[0]?.servicio?.id_servicio
      if (typeof idServicio === 'number') {
        debtById.set(idServicio, (debtById.get(idServicio) ?? 0) + monto)
      }
    }

    console.log('[/api/clients] facturas totales:', allInvoicesRaw.results.length)
    console.log('[/api/clients] clientes con deuda:', debtById.size)
    if (debtById.size > 0) {
      console.log('[/api/clients] muestra deuda (id → monto):', [...debtById.entries()].slice(0, 3))
    }

    const clients: BffClientRecord[] = []
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success) {
        clients.push({
          nombre: parsed.data.nombre,
          estado: parsed.data.estado,
          saldo: Math.round((debtById.get(parsed.data.id_servicio) ?? 0) * 100) / 100,
          plan: parsed.data.plan_internet?.nombre ?? null,
          zona: parsed.data.zona?.nombre ?? null,
        })
      } else {
        validationWarnings++
      }
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/clients] ${validationWarnings} client records failed Zod validation`)
    }

    const data: ClientsData = {
      clients,
      totalCount: clients.length,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/clients] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})

clientsRouter.get('/api/clients/installed-this-month', async (_req: Request, res: Response) => {
  const cached = cache.get<InstalledClientsData>(INSTALLED_CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allRaw = await fetchAllPages<unknown>('/api/clientes/')
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1  // 1-indexed for comparison

    const clients: InstalledClientRecord[] = []
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (!parsed.success) { validationWarnings++; continue }
      if (!parsed.data.fecha_alta) continue

      const [year, month] = parsed.data.fecha_alta.split('-').map(Number)
      if (year !== currentYear || month !== currentMonth) continue

      clients.push({
        nombre: parsed.data.nombre,
        plan: parsed.data.plan_internet?.nombre ?? null,
        zona: parsed.data.zona?.nombre ?? null,
        fechaAlta: parsed.data.fecha_alta,
      })
    }

    if (validationWarnings > 0) {
      console.warn(`[/api/clients/installed-this-month] ${validationWarnings} records failed Zod validation`)
    }

    const data: InstalledClientsData = {
      clients,
      totalCount: clients.length,
      month: currentMonth,
      year: currentYear,
      fetchedAt: now.toISOString(),
    }

    cache.set(INSTALLED_CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/clients/installed-this-month] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: { code: 'UPSTREAM_ERROR', message: err instanceof Error ? err.message : 'Unknown upstream error' },
    })
  }
})
