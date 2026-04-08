// Tipos derivados del BFF (server/src/routes/metrics.ts y invoices.ts)
// IMPORTANTE: estos tipos deben mantenerse sincronizados con los interfaces del server

// ── Factura individual ──
export interface BffInvoice {
  id_factura: number
  fecha_emision: string         // ISO date string ("2025-01-15")
  fecha_vencimiento: string     // ISO date string — usado para calcular días de atraso
  fecha_pago: string | null     // null si no pagada
  estado: 'Pagada' | 'Pendiente' | 'Vencida' | 'Cancelada' | string
  total: number                 // total en pesos colombianos
  saldo: number                 // monto pendiente (0 si pagada)
  total_cobrado: number
  cliente: {
    nombre: string
    email?: string
    telefono?: string
  }
}

// ── Respuesta GET /api/metrics ──
export interface MetricsData {
  activeClients: number
  suspendedClients: number      // Clientes con estado === 'Suspendido' en Wisphub
  pendingDebt: number
  monthlyRevenue: number
  fetchedAt: string
}

export interface MetricsResponse {
  success: true
  data: MetricsData
  cached?: boolean
}

// ── Respuesta GET /api/invoices ──
export interface InvoicesData {
  invoices: BffInvoice[]
  totalCount: number
  fetchedAt: string
}

export interface InvoicesResponse {
  success: true
  data: InvoicesData
  cached?: boolean
}

// ── Error response (ambos endpoints) ──
export interface BffErrorResponse {
  success: false
  error: {
    code: 'UPSTREAM_ERROR' | 'VALIDATION_ERROR' | string
    message: string
    details?: unknown
  }
}

// ── Helper: discriminated union para type-safe error handling ──
export type MetricsApiResponse = MetricsResponse | BffErrorResponse
export type InvoicesApiResponse = InvoicesResponse | BffErrorResponse
