import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { metricsRouter } from './routes/metrics'
import { invoicesRouter } from './routes/invoices'
import { clientsRouter } from './routes/clients'
import { growthRouter } from './routes/growth'
import { plansRouter } from './routes/plans'
import { zonesRouter } from './routes/zones'
import { moraRouter } from './routes/mora'
import { antiguedadRouter } from './routes/antiguedad'
import { inversionRouter } from './routes/inversion'
import { cobranzaRouter } from './routes/cobranza'
import { authRouter } from './routes/auth'
import { requireAuth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'

// Env validation — fail fast if required vars are missing
const EnvSchema = z.object({
  WISPHUB_TOKEN: z.string().min(1, 'WISPHUB_TOKEN is required'),
  WISPHUB_BASE_URL: z.string().url('WISPHUB_BASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  AUTH_USERS: z.string().min(2, 'AUTH_USERS is required — JSON array of {username,hash,nombre}'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
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
  origin: 'http://localhost:5173', // dev only — in production requests are same-origin
  credentials: false,
}))
app.use(express.json())

// Static files — serve Vite build in production
if (env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
}

// Health endpoint — public
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes — public (login, me)
app.use(authRouter)

// All subsequent /api/* routes require a valid JWT
app.use('/api', requireAuth)

// BFF routes
app.use(metricsRouter)
app.use(invoicesRouter)
app.use(clientsRouter)
app.use(growthRouter)
app.use(plansRouter)
app.use(zonesRouter)
app.use(moraRouter)
app.use(antiguedadRouter)
app.use(inversionRouter)
app.use(cobranzaRouter)

// 404 handler for unregistered API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

// SPA fallback — send index.html for any non-API path in production
if (env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist')
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Error handler must be last middleware (4-argument signature required by Express)
app.use(errorHandler)

const port = parseInt(env.PORT, 10)
app.listen(port, () => {
  console.log(`[BFF] Server running on http://localhost:${port}`)
  console.log(`[BFF] Wisphub base URL: ${env.WISPHUB_BASE_URL}`)
  console.log(`[BFF] Mode: ${env.NODE_ENV}`)
})
