import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { metricsRouter } from './routes/metrics'
import { invoicesRouter } from './routes/invoices'
import { clientsRouter } from './routes/clients'
import { errorHandler } from './middleware/errorHandler'

// Env validation — fail fast if required vars are missing (per D-16, Claude's Discretion)
const EnvSchema = z.object({
  WISPHUB_TOKEN: z.string().min(1, 'WISPHUB_TOKEN is required'),
  WISPHUB_BASE_URL: z.string().url('WISPHUB_BASE_URL must be a valid URL'),
  PORT: z.string().default('3001'),
})

const envResult = EnvSchema.safeParse(process.env)
if (!envResult.success) {
  console.error('[STARTUP ERROR] Missing required environment variables:')
  console.error(envResult.error.flatten().fieldErrors)
  process.exit(1)
}

const env = envResult.data
const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // per D-15 — only allow the Vite dev server
  credentials: false,
}))
app.use(express.json())

// Health endpoint — used by Plan 01 verification
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// BFF routes
app.use(metricsRouter)
app.use(invoicesRouter)
app.use(clientsRouter)

// DEBUG — buscar la primera factura "Pendiente de Pago" y mostrarla completa
import { wisphubClient } from './lib/wisphub'
app.get('/api/debug/raw', async (_req, res) => {
  // Traer las primeras 300 facturas y encontrar una "Pendiente de Pago"
  const resp = await wisphubClient.get('/api/facturas/', { params: { limit: 300, offset: 0 } })
  const todas: any[] = resp.data.results ?? []
  const pendiente = todas.find((f: any) => f.estado !== 'Pagada' && f.estado !== 'Cancelada')
  const estadosUnicos = [...new Set(todas.map((f: any) => f.estado))]

  res.json({
    total_facturas: resp.data.count,
    estados_en_300: estadosUnicos,
    primera_no_pagada: pendiente ?? 'ninguna en primeras 300',
    campos_financieros: pendiente ? {
      estado: pendiente.estado,
      saldo: pendiente.saldo,
      saldo_nuevo: pendiente.saldo_nuevo,
      total: pendiente.total,
      total_cobrado: pendiente.total_cobrado,
      sub_total: pendiente.sub_total,
    } : null,
  })
})

// 404 handler for unregistered routes — must be after BFF routes, before errorHandler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

// Error handler must be last middleware (4-argument signature required by Express)
app.use(errorHandler)

const port = parseInt(env.PORT, 10)
app.listen(port, () => {
  console.log(`[BFF] Server running on http://localhost:${port}`)
  console.log(`[BFF] Wisphub base URL: ${env.WISPHUB_BASE_URL}`)
})
