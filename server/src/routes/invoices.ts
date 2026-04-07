import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { WisphubInvoiceSchema } from '../lib/schemas'
import { cache } from '../lib/cache'
import { z } from 'zod'

export const invoicesRouter = Router()

const CACHE_KEY = 'invoices'
const CACHE_TTL_MS = 30_000  // 30 seconds

interface InvoicesData {
  invoices: z.infer<typeof WisphubInvoiceSchema>[]
  totalCount: number
  fetchedAt: string
}

invoicesRouter.get('/api/invoices', async (_req: Request, res: Response) => {
  // Check cache first
  const cached = cache.get<InvoicesData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    // Fetch all invoices — pagination exhausted server-side
    const result = await fetchAllPages<unknown>('/api/facturas/')

    // Validate each invoice record with Zod
    const invoices: z.infer<typeof WisphubInvoiceSchema>[] = []
    const validationErrors: unknown[] = []

    for (const raw of result.results) {
      const parsed = WisphubInvoiceSchema.safeParse(raw)
      if (parsed.success) {
        invoices.push(parsed.data)
      } else {
        validationErrors.push({ raw, errors: parsed.error.flatten() })
      }
    }

    if (validationErrors.length > 0) {
      console.warn(
        `[/api/invoices] ${validationErrors.length} records failed Zod validation — check schemas.ts against 02-api-shapes.md`
      )
    }

    // If ALL records fail validation, return VALIDATION_ERROR (per D-22)
    if (result.results.length > 0 && invoices.length === 0) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unexpected Wisphub invoice response shape',
          details: { firstError: validationErrors[0] },
        },
      })
    }

    const data: InvoicesData = {
      invoices,
      totalCount: result.count,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err) {
    console.error('[/api/invoices] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
