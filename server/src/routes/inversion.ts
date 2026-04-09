import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cache } from '../lib/cache'

export const inversionRouter = Router()

const CACHE_KEY = 'inversion'
const CACHE_TTL_MS = 5 * 60_000  // 5 minutos — data cambia poco

// Google Sheets public CSV export URL
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1u1MVyXJEWljQRT9YvTwG08HH8ebemrhI/export?format=csv&gid=289872435'

// ── CSV parser — handles quoted fields correctly ──
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    if (!line.trim()) continue
    const row: string[] = []
    let field = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { field += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        row.push(field.trim())
        field = ''
      } else {
        field += ch
      }
    }
    row.push(field.trim())
    rows.push(row)
  }
  return rows
}

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

  try {
    const response = await axios.get<string>(SHEET_URL, {
      responseType: 'text',
      maxRedirects: 5,
      timeout: 10_000,
    })

    const rows = parseCSV(response.data)
    if (rows.length < 2) {
      throw new Error('Google Sheets CSV vacío o sin datos')
    }

    // Row 0 = headers: Fecha, Nelson García, Arley Valencia, Jaime Giraldo, Juan Camilo R, Observaciones
    // Row 1 = saldo inicial (sin fecha)
    // Rows 2..n-2 = transacciones
    // Row n-1 = totales (sin fecha, sin observación)

    const initialRow = rows[1]
    const saldoInicial = {
      nelson:    parseMoney(initialRow[1]) ?? 0,
      arley:     parseMoney(initialRow[2]) ?? 0,
      jaime:     parseMoney(initialRow[3]) ?? 0,
      juanCamilo: parseMoney(initialRow[4]) ?? 0,
    }

    // Last row with actual values is the totals row (last non-empty row)
    const lastRow = rows[rows.length - 1]
    const totales = {
      nelson:    parseMoney(lastRow[1]) ?? 0,
      arley:     parseMoney(lastRow[2]) ?? 0,
      jaime:     parseMoney(lastRow[3]) ?? 0,
      juanCamilo: parseMoney(lastRow[4]) ?? 0,
    }

    const totalGeneral = totales.nelson + totales.arley + totales.jaime + totales.juanCamilo

    const accionistas: InversionAccionista[] = [
      { key: 'nelson',    nombre: 'Nelson García',  saldoInicial: saldoInicial.nelson,    total: totales.nelson,    porcentaje: totalGeneral > 0 ? (totales.nelson / totalGeneral) * 100 : 0 },
      { key: 'arley',     nombre: 'Arley Valencia', saldoInicial: saldoInicial.arley,     total: totales.arley,     porcentaje: totalGeneral > 0 ? (totales.arley / totalGeneral) * 100 : 0 },
      { key: 'jaime',     nombre: 'Jaime Giraldo',  saldoInicial: saldoInicial.jaime,     total: totales.jaime,     porcentaje: totalGeneral > 0 ? (totales.jaime / totalGeneral) * 100 : 0 },
      { key: 'juanCamilo', nombre: 'Juan Camilo R.', saldoInicial: saldoInicial.juanCamilo, total: totales.juanCamilo, porcentaje: totalGeneral > 0 ? (totales.juanCamilo / totalGeneral) * 100 : 0 },
    ]

    // Transacciones: rows 2 to length-2 (skip header, initial, and totals)
    const transacciones: InversionTransaccion[] = []
    for (let i = 2; i < rows.length - 1; i++) {
      const row = rows[i]
      const fecha = row[0]
      const nelson    = parseMoney(row[1])
      const arley     = parseMoney(row[2])
      const jaime     = parseMoney(row[3])
      const juanCamilo = parseMoney(row[4])
      const observacion = row[5] ?? ''

      // Skip rows that are completely empty
      if (!fecha && !nelson && !arley && !jaime && !juanCamilo && !observacion) continue

      const tx: InversionTransaccion = { fecha, observacion }
      if (nelson    !== undefined) tx.nelson    = nelson
      if (arley     !== undefined) tx.arley     = arley
      if (jaime     !== undefined) tx.jaime     = jaime
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

  } catch (err) {
    console.error('[/api/inversion] Error fetching Google Sheets:', err)
    return res.status(502).json({
      success: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'No se pudo leer el Google Sheet',
      },
    })
  }
})
