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
  installedThisMonth: number    // Clientes con fecha_alta en el mes actual (0 si campo no disponible)
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

// ── Cliente individual (BFF normalizado) ──
export interface BffClient {
  nombre: string
  estado: string          // "Activo" | "Suspendido" | "Cancelado"
  saldo: number           // ya parseado como número
  plan: string | null     // plan_internet.nombre o null
  zona: string | null     // zona.nombre o null
}

// ── Respuesta GET /api/clients ──
export interface ClientsData {
  clients: BffClient[]
  totalCount: number
  fetchedAt: string
}

export interface ClientsResponse {
  success: true
  data: ClientsData
  cached?: boolean
}

export type ClientsApiResponse = ClientsResponse | BffErrorResponse

// ── Cliente instalado este mes (BFF normalizado) ──
export interface BffInstalledClient {
  nombre: string
  plan: string | null
  zona: string | null
  fechaAlta: string   // "DD/MM/YYYY HH:MM:SS"
  precioPlan: number  // valor mensual del plan en COP
}

// ── Respuesta GET /api/clients/installed-this-month ──
export interface InstalledClientsData {
  clients: BffInstalledClient[]
  totalCount: number
  totalRevenue: number  // suma de precio_plan de todos los instalados este mes
  month: number
  year: number
  fetchedAt: string
}

export interface InstalledClientsResponse {
  success: true
  data: InstalledClientsData
  cached?: boolean
}

export type InstalledClientsApiResponse = InstalledClientsResponse | BffErrorResponse

// ── Crecimiento histórico ──
export interface GrowthClientPoint {
  month: string
  newClients: number
  totalClients: number
}

export interface GrowthRevenuePoint {
  month: string
  revenue: number
  totalRevenue: number
}

export interface GrowthData {
  clientGrowth: GrowthClientPoint[]
  revenueHistory: GrowthRevenuePoint[]
  fetchedAt: string
}

export interface GrowthResponse {
  success: true
  data: GrowthData
  cached?: boolean
}

export type GrowthApiResponse = GrowthResponse | BffErrorResponse
