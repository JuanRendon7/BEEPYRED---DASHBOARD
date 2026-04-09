import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cache } from '../lib/cache'

export const inversionRouter = Router()

const CACHE_KEY = 'inversion'
const CACHE_TTL_MS = 5 * 60_000  // 5 minutos

const SHEET_ID  = '1u1MVyXJEWljQRT9YvTwG08HH8ebemrhI'
const TAB_NAME  = process.env.GOOGLE_SHEETS_TAB_NAME ?? 'Hoja1'
const API_KEY   = process.env.GOOGLE_SHEETS_API_KEY ?? ''

// ── Parse "$61,613,697" → 61613697 ──
function parseMoney(s: string): number | undefined {
  if (!s || s === '-' || s === '—') return undefined
  const cleaned = s.replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? undefined : n
}

export interface InversionAccionista {
  key: string
  nombre: string
  saldoInicial: number
  total: number
  porcentaje: number
}

export interface InversionTransaccion {
  fecha: string
  nelson?: number
  arley?: number
  jaime?: number
  juanCamilo?: number
  observacion: string
}

export interface InversionData {
  accionistas: InversionAccionista[]
  transacciones: InversionTransaccion[]
  totalGeneral: number
  fetchedAt: string
}

inversionRouter.get('/api/inversion', async (_req: Request, res: Response) => {
  const cached = cache.get<InversionData>(CACHE_KEY)
  if (cached) {
    return res.json({ success: true, data: cached, cached: true })
  }

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: { code: 'CONFIG_ERROR', message: 'GOOGLE_SHEETS_API_KEY no configurada en el servidor' },
    })
  }

  try {
    // Sheets API v4 — range: todas las filas de columnas A:F
    const range = encodeURIComponent(`${TAB_NAME}!A:F`)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`

    const response = await axios.get<{ values: string[][] }>(url, { timeout: 10_000 })

    const rows: string[][] = response.data.values ?? []
    if (rows.length < 2) {
      throw new Error('Google Sheet sin datos suficientes')
    }

    // Row 0 = headers: Fecha, Nelson García, Arley Valencia, Jaime Giraldo, Juan Camilo R, Observaciones
    // Row 1 = saldo inicial (sin fecha)
    // Rows 2..n-2 = transacciones
    // Row n-1 = totales

    const initialRow = rows[1] ?? []
    const saldoInicial = {
      nelson:     parseMoney(initialRow[1]) ?? 0,
      arley:      parseMoney(initialRow[2]) ?? 0,
      jaime:      parseMoney(initialRow[3]) ?? 0,
      juanCamilo: parseMoney(initialRow[4]) ?? 0,
    }

    const lastRow = rows[rows.length - 1] ?? []
    const totales = {
      nelson:     parseMoney(lastRow[1]) ?? 0,
      arley:      parseMoney(lastRow[2]) ?? 0,
      jaime:      parseMoney(lastRow[3]) ?? 0,
      juanCamilo: parseMoney(lastRow[4]) ?? 0,
    }

    const totalGeneral = totales.nelson + totales.arley + totales.jaime + totales.juanCamilo

    const accionistas: InversionAccionista[] = [
      { key: 'nelson',     nombre: 'Nelson García',   saldoInicial: saldoInicial.nelson,     total: totales.nelson,     porcentaje: totalGeneral > 0 ? (totales.nelson / totalGeneral) * 100 : 0 },
      { key: 'arley',      nombre: 'Arley Valencia',  saldoInicial: saldoInicial.arley,      total: totales.arley,      porcentaje: totalGeneral > 0 ? (totales.arley / totalGeneral) * 100 : 0 },
      { key: 'jaime',      nombre: 'Jaime Giraldo',   saldoInicial: saldoInicial.jaime,      total: totales.jaime,      porcentaje: totalGeneral > 0 ? (totales.jaime / totalGeneral) * 100 : 0 },
      { key: 'juanCamilo', nombre: 'Juan Camilo R.',  saldoInicial: saldoInicial.juanCamilo, total: totales.juanCamilo, porcentaje: totalGeneral > 0 ? (totales.juanCamilo / totalGeneral) * 100 : 0 },
    ]

    const transacciones: InversionTransaccion[] = []
    for (let i = 2; i < rows.length - 1; i++) {
      const row = rows[i]
      const fecha      = row[0] ?? ''
      const nelson     = parseMoney(row[1])
      const arley      = parseMoney(row[2])
      const jaime      = parseMoney(row[3])
      const juanCamilo = parseMoney(row[4])
      const observacion = row[5] ?? ''

      if (!fecha && !nelson && !arley && !jaime && !juanCamilo && !observacion) continue

      const tx: InversionTransaccion = { fecha, observacion }
      if (nelson     !== undefined) tx.nelson     = nelson
      if (arley      !== undefined) tx.arley      = arley
      if (jaime      !== undefined) tx.jaime      = jaime
      if (juanCamilo !== undefined) tx.juanCamilo = juanCamilo
      transacciones.push(tx)
    }

    const data: InversionData = { accionistas, transacciones, totalGeneral, fetchedAt: new Date().toISOString() }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err: unknown) {
    console.error('[/api/inversion] Error fetching Google Sheets API:', err)

    // Mensaje de error legible — incluye detalle si es error 403/400 de Google
    let message = err instanceof Error ? err.message : 'No se pudo leer el Google Sheet'
    if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
      message = err.response.data.error.message
    }

    return res.status(502).json({ success: false, error: { code: 'UPSTREAM_ERROR', message } })
  }
})

// Endpoint para forzar refresh invalidando caché
inversionRouter.post('/api/inversion/refresh', (_req: Request, res: Response) => {
  cache.delete(CACHE_KEY)
  res.json({ success: true, message: 'Caché invalidado — próximo GET traerá datos frescos' })
})
