import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cache } from '../lib/cache'

export const inversionRouter = Router()

const CACHE_KEY = 'inversion'
const CACHE_TTL_MS = 5 * 60_000  // 5 minutos

// Exportación CSV pública — no requiere API key
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1u1MVyXJEWljQRT9YvTwG08HH8ebemrhI/export?format=csv&gid=289872435'

// ── Parsea "$61,613,697" → 61613697 ──
function parseMoney(s: string): number | undefined {
  if (!s || s === '-' || s === '—') return undefined
  const cleaned = s.replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? undefined : n
}

// ── Parser CSV mínimo que maneja campos entre comillas ──
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    cells.push(current.trim())
    rows.push(cells)
  }
  return rows
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

  try {
    const response = await axios.get<string>(CSV_URL, {
      timeout: 10_000,
      responseType: 'text',
      maxRedirects: 5,
    })

    const rows = parseCSV(response.data)

    // Row 0 = encabezados: Fecha, Nelson García, Arley Valencia, Jaime Giraldo, Juan Camilo R, Observaciones
    // Row 1 = saldo inicial (sin fecha)
    // Rows 2..n-2 = transacciones
    // Row n-1 = fila TOTAL
    if (rows.length < 3) {
      throw new Error('Google Sheet sin datos suficientes')
    }

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
      { key: 'nelson',     nombre: 'Nelson García',   saldoInicial: saldoInicial.nelson,     total: totales.nelson,     porcentaje: totalGeneral > 0 ? (totales.nelson     / totalGeneral) * 100 : 0 },
      { key: 'arley',      nombre: 'Arley Valencia',  saldoInicial: saldoInicial.arley,      total: totales.arley,      porcentaje: totalGeneral > 0 ? (totales.arley      / totalGeneral) * 100 : 0 },
      { key: 'jaime',      nombre: 'Jaime Giraldo',   saldoInicial: saldoInicial.jaime,      total: totales.jaime,      porcentaje: totalGeneral > 0 ? (totales.jaime      / totalGeneral) * 100 : 0 },
      { key: 'juanCamilo', nombre: 'Juan Camilo R.',  saldoInicial: saldoInicial.juanCamilo, total: totales.juanCamilo, porcentaje: totalGeneral > 0 ? (totales.juanCamilo / totalGeneral) * 100 : 0 },
    ]

    const transacciones: InversionTransaccion[] = []
    for (let i = 2; i < rows.length - 1; i++) {
      const row = rows[i]
      const fecha       = row[0] ?? ''
      const nelson      = parseMoney(row[1])
      const arley       = parseMoney(row[2])
      const jaime       = parseMoney(row[3])
      const juanCamilo  = parseMoney(row[4])
      const observacion = row[5] ?? ''

      if (!fecha && !nelson && !arley && !jaime && !juanCamilo && !observacion) continue

      const tx: InversionTransaccion = { fecha, observacion }
      if (nelson     !== undefined) tx.nelson     = nelson
      if (arley      !== undefined) tx.arley      = arley
      if (jaime      !== undefined) tx.jaime      = jaime
      if (juanCamilo !== undefined) tx.juanCamilo = juanCamilo
      transacciones.push(tx)
    }

    const data: InversionData = {
      accionistas,
      transacciones,
      totalGeneral,
      fetchedAt: new Date().toISOString(),
    }

    cache.set(CACHE_KEY, data, CACHE_TTL_MS)
    return res.json({ success: true, data })

  } catch (err: unknown) {
    console.error('[/api/inversion] Error:', err)
    let message = err instanceof Error ? err.message : 'No se pudo leer el Google Sheet'
    if (axios.isAxiosError(err) && err.response?.data) {
      message = `Google Sheets error: ${JSON.stringify(err.response.data)}`
    }
    return res.status(502).json({ success: false, error: { code: 'UPSTREAM_ERROR', message } })
  }
})

// Forzar refresh invalidando caché
inversionRouter.post('/api/inversion/refresh', (_req: Request, res: Response) => {
  cache.delete(CACHE_KEY)
  res.json({ success: true, message: 'Caché invalidado — próximo GET traerá datos frescos' })
})
