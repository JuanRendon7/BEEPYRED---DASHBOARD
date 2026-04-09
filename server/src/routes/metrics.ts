import { Router, Request, Response } from 'express'
import { fetchAllPages, wisphubClient } from '../lib/wisphub'
import { WisphubClientSchema } from '../lib/schemas'
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
  installedThisMonth: number     // Clients with fecha_alta in current month/year
  fetchedAt: string
}

metricsRouter.get('/api/debug/invoices-fields', async (_req: Request, res: Response) => {
  const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')
  const byEstado: Record<string, { count: number; sumTotal: number; sumTotalCobrado: number; sumSaldo: number }> = {}
  for (const raw of allInvoicesRaw.results) {
    const r = raw as any
    const estado: string = r.estado ?? 'undefined'
    const total: number = typeof r.total === 'number' ? r.total : parseFloat(r.total ?? '0')
    const totalCobrado: number = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
    const saldo: number = typeof r.saldo === 'number' ? r.saldo : parseFloat(r.saldo ?? '0')
    if (!byEstado[estado]) byEstado[estado] = { count: 0, sumTotal: 0, sumTotalCobrado: 0, sumSaldo: 0 }
    byEstado[estado].count++
    byEstado[estado].sumTotal += total
    byEstado[estado].sumTotalCobrado += totalCobrado
    byEstado[estado].sumSaldo += saldo
  }
  return res.json({
    totalFacturasRecibidas: allInvoicesRaw.results.length,
    totalFacturasSegunAPI: allInvoicesRaw.count,
    hayFacturasFaltantes: allInvoicesRaw.count !== allInvoicesRaw.results.length,
    byEstado,
  })
})

metricsRouter.get('/api/debug/saldo-vs-facturas', async (_req: Request, res: Response) => {
  // Toma los primeros 5 clientes con facturas "Pendiente de Pago"
  // y compara la suma de sus facturas vs el saldo real del endpoint /clientes/{id}/saldo/
  const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')

  // Agrupar facturas pendientes por id_servicio
  const pendingByClient = new Map<number, { sumFacturas: number; nombre: string; facturaCount: number }>()
  for (const raw of allInvoicesRaw.results) {
    const r = raw as any
    if (r.estado !== 'Pendiente de Pago') continue
    const idServicio = r.articulos?.[0]?.servicio?.id_servicio
    if (typeof idServicio !== 'number') continue
    const monto: number = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
    const existing = pendingByClient.get(idServicio) ?? { sumFacturas: 0, nombre: r.cliente?.nombre ?? '?', facturaCount: 0 }
    pendingByClient.set(idServicio, { sumFacturas: existing.sumFacturas + monto, nombre: existing.nombre, facturaCount: existing.facturaCount + 1 })
  }

  // Tomar los primeros 5 ids
  const sample = [...pendingByClient.entries()].slice(0, 5)

  // Llamar /clientes/{id}/ (detalle completo) para ver todos los campos de saldo
  const results = await Promise.all(sample.map(async ([idServicio, data]) => {
    try {
      const resp = await wisphubClient.get<any>(`/api/clientes/${idServicio}/`)
      const d = resp.data
      // Extraer todos los campos que puedan representar saldo/deuda
      return {
        idServicio,
        nombre: data.nombre,
        facturaCount: data.facturaCount,
        sumFacturas: data.sumFacturas,
        camposSaldo: {
          saldo: d.saldo,
          saldo_favor: d.saldo_favor,
          deuda: d.deuda,
          balance: d.balance,
          monto_pendiente: d.monto_pendiente,
          total_deuda: d.total_deuda,
          estado_facturas: d.estado_facturas,
          // Mostrar todas las keys del response para descubrir campos desconocidos
          todasLasKeys: Object.keys(d),
        },
      }
    } catch (err: any) {
      return {
        idServicio,
        nombre: data.nombre,
        facturaCount: data.facturaCount,
        sumFacturas: data.sumFacturas,
        camposSaldo: { error: err?.message ?? 'request failed' },
      }
    }
  }))

  return res.json({ muestraDeClientesConPendiente: results })
})

metricsRouter.get('/api/debug/clients-saldo', async (_req: Request, res: Response) => {
  const allClientsRaw = await fetchAllPages<unknown>('/api/clientes/')
  let totalSaldo = 0
  let clientesConSaldo = 0
  const detalles: { nombre: string; saldo: string | number }[] = []
  for (const raw of allClientsRaw.results) {
    const r = raw as any
    const saldo = parseFloat(r.saldo ?? '0')
    if (saldo > 0) {
      clientesConSaldo++
      totalSaldo += saldo
      detalles.push({ nombre: r.nombre, saldo: r.saldo })
    }
  }
  return res.json({ totalClientes: allClientsRaw.results.length, clientesConSaldo, totalSaldo, detalles })
})

metricsRouter.get('/api/debug/revenue', async (_req: Request, res: Response) => {
  const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  let conFechaPagoEsteMes = 0, totalConFechaPago = 0
  let sinFechaPago = 0, totalSinFechaPago = 0
  let conFechaPagoOtroMes = 0, totalOtroMes = 0
  let usandoTotal = 0, usandoTotalCobrado = 0

  const ejemplosSinFecha: unknown[] = []

  for (const raw of allInvoicesRaw.results) {
    const r = raw as any
    if (r.estado !== 'Pagada') continue
    const tc: number = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
    const t: number  = typeof r.total === 'number' ? r.total : parseFloat(r.total ?? '0')
    usandoTotalCobrado += tc
    usandoTotal += t
    if (!r.fecha_pago) {
      sinFechaPago++; totalSinFechaPago += tc
      if (ejemplosSinFecha.length < 3) ejemplosSinFecha.push({ cliente: r.cliente?.nombre, total_cobrado: tc, fecha_emision: r.fecha_emision })
    } else {
      const d = new Date(r.fecha_pago)
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        conFechaPagoEsteMes++; totalConFechaPago += tc
      } else {
        conFechaPagoOtroMes++; totalOtroMes += tc
      }
    }
  }
  return res.json({
    mesActual: `${currentMonth + 1}/${currentYear}`,
    pagadasEsteMes:    { count: conFechaPagoEsteMes,  total_cobrado: Math.round(totalConFechaPago) },
    pagadasSinFecha:   { count: sinFechaPago,          total_cobrado: Math.round(totalSinFechaPago), ejemplos: ejemplosSinFecha },
    pagadasOtroMes:    { count: conFechaPagoOtroMes,   total_cobrado: Math.round(totalOtroMes) },
    totalPagadas_total_cobrado: Math.round(usandoTotalCobrado),
    totalPagadas_total:         Math.round(usandoTotal),
  })
})

metricsRouter.get('/api/debug/invoices-by-estado', async (_req: Request, res: Response) => {
  const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')
  const breakdown: Record<string, { count: number; total: number }> = {}
  for (const raw of allInvoicesRaw.results) {
    const r = raw as any
    const estado: string = r.estado ?? 'undefined'
    const monto: number = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
    if (!breakdown[estado]) breakdown[estado] = { count: 0, total: 0 }
    breakdown[estado].count++
    breakdown[estado].total += monto
  }
  return res.json({ totalFacturas: allInvoicesRaw.results.length, breakdown })
})

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
        if (parsed.data.estado === 'Activo' || parsed.data.estado === 'Gratis') {
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

    // ── installedThisMonth: clients with fecha_alta in current month ──
    let installedThisMonth = 0
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    for (const raw of allClientsRaw.results) {
      const parsed = WisphubClientSchema.safeParse(raw)
      if (parsed.success && parsed.data.fecha_instalacion) {
        // Format: "DD/MM/YYYY HH:MM:SS"
        const [, monthStr, yearStr] = parsed.data.fecha_instalacion.split(' ')[0].split('/')
        const year = Number(yearStr), month = Number(monthStr)
        if (!isNaN(year) && !isNaN(month) && year === currentYear && month === currentMonth + 1) {
          installedThisMonth++
        }
      }
    }

    // Fetch todas las facturas — acceso directo via casteo (any) sin Zod
    const allInvoicesRaw = await fetchAllPages<unknown>('/api/facturas/')

    let pendingDebt = 0
    let monthlyRevenue = 0

    for (const raw of allInvoicesRaw.results) {
      const r = raw as any
      const estado: string = r.estado ?? ''
      const totalCobrado: number = typeof r.total_cobrado === 'number' ? r.total_cobrado : parseFloat(r.total_cobrado ?? '0')
      const fechaPago: string | null = r.fecha_pago ?? null

      // Deuda pendiente — "Pendiente de Pago" usa total_cobrado (saldo siempre es 0)
      if (estado === 'Pendiente de Pago') {
        pendingDebt += totalCobrado
      }

      // Ingresos del mes — Pagada con fecha_pago en el mes actual
      if (estado === 'Pagada' && fechaPago) {
        const paidDate = new Date(fechaPago)
        if (paidDate.getFullYear() === currentYear && paidDate.getMonth() === currentMonth) {
          monthlyRevenue += totalCobrado
        }
      }
    }

    console.log('[/api/metrics] facturas totales:', allInvoicesRaw.results.length, '| pendingDebt:', pendingDebt, '| monthlyRevenue:', monthlyRevenue)

    const data: MetricsData = {
      activeClients: activeClients.length,
      suspendedClients,
      pendingDebt: Math.round(pendingDebt * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      installedThisMonth,
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
