import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
import { cache } from '../lib/cache'

export const clientsRouter = Router()

const CACHE_KEY = 'clients'
const CACHE_TTL_MS = 30_000

interface BffClientRecord {
  nombre: string
  estado: string
  saldo: number          // parseFloat del string de Wisphub
  plan: string | null    // plan_internet.nombre o null
  zona: string | null    // zona.nombre o null
}

interface ClientsData {
  clients: BffClientRecord[]
  totalCount: number
  fetchedAt: string
}

clientsRouter.get('/api/clients', async (_req: Request, res: Response) => {
  // Check cache first — prevents hammering Wisphub on repeated requests
  const cached = cache.get<ClientsData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allRaw = await fetchAllPages<unknown>('/api/clientes/')

    const clients: BffClientRecord[] = []
    let validationWarnings = 0

    for (const raw of allRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success) {
        clients.push({
          nombre: parsed.data.nombre,
          estado: parsed.data.estado,
          saldo: parseFloat(parsed.data.saldo) || 0,
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
