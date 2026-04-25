import { Router, Request, Response } from 'express'
import { fetchAllPages } from '../lib/wisphub'
import { cache } from '../lib/cache'

export const cobranzaRouter = Router()

const CACHE_KEY = 'cobranza'
const CACHE_TTL_MS = 30_000

interface CobranzaData {
  tasaCobranzaMes: number        // % facturas emitidas este mes que ya fueron cobradas
  tasaCobranzaGeneral: number    // % histórico total de facturas cobradas
  avgPaymentDays: number         // días promedio entre emisión y pago
  facturasPagadasMes: number
  facturasEmitidasMes: number
  facturasPagadasTotal: number
  facturasEmitidasTotal: number  // excluye canceladas
  fetchedAt: string
}

cobranzaRouter.get('/api/cobranza', async (_req: Request, res: Response) => {
  const cached = cache.get<CobranzaData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  try {
    const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    let facturasPagadasMes = 0
    let facturasEmitidasMes = 0
    let facturasPagadasTotal = 0
    let facturasEmitidasTotal = 0
    let totalPaymentDays = 0
    let paymentDaysCount = 0

    for (const raw of allInvoicesRaw.results) {
      const r = raw as any
      const estado: string = r.estado ?? ''
      if (estado === 'Cancelada') continue

      facturasEmitidasTotal++

      const fechaEmision = r.fecha_emision ? new Date(r.fecha_emision) : null
      const emitidaEsteMes =
        fechaEmision &&
        !isNaN(fechaEmision.getTime()) &&
        fechaEmision.getFullYear() === currentYear &&
        fechaEmision.getMonth() === currentMonth

      if (emitidaEsteMes) facturasEmitidasMes++

      if (estado === 'Pagada') {
        facturasPagadasTotal++
        if (emitidaEsteMes) facturasPagadasMes++

        // Días promedio de pago: fecha_pago - fecha_emision
        if (r.fecha_pago && fechaEmision && !isNaN(fechaEmision.getTime())) {
          const fechaPago = new Date(r.fecha_pago)
          if (!isNaN(fechaPago.getTime())) {
            const diffDays = Math.round(
              (fechaPago.getTime() - fechaEmision.getTime()) / (1000 * 60 * 60 * 24)
            )
            // Filtro de sanidad: entre 0 y 365 días
            if (diffDays >= 0 && diffDays <= 365) {
              totalPaymentDays += diffDays
              paymentDaysCount++
            }
          }
        }
      }
    }

    const tasaCobranzaMes =
      facturasEmitidasMes > 0
        ? Math.round((facturasPagadasMes / facturasEmitidasMes) * 1000) / 10
        : 0

    const tasaCobranzaGeneral =
      facturasEmitidasTotal > 0
        ? Math.round((facturasPagadasTotal / facturasEmitidasTotal) * 1000) / 10
        : 0

    const avgPaymentDays =
      paymentDaysCount > 0 ? Math.round(totalPaymentDays / paymentDaysCount) : 0

    const data: CobranzaData = {
      tasaCobranzaMes,
      tasaCobranzaGeneral,
      avgPaymentDays,
      facturasPagadasMes,
      facturasEmitidasMes,
      facturasPagadasTotal,
      facturasEmitidasTotal,
      fetchedAt: now.toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })
  } catch (err) {
    console.error('[/api/cobranza] Upstream error:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown upstream error',
      },
    })
  }
})
