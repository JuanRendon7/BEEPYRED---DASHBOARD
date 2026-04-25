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
  canceledClients: number       // Clientes con estado === 'Cancelado'
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
  id_servicio: number
  nombre: string
  estado: string               // "Activo" | "Suspendido" | "Cancelado"
  plan: string | null          // plan_internet.nombre o null
  precio_plan: number
  zona: string | null          // zona.nombre o null
  saldo: number                // ya parseado como número
  fecha_instalacion: string | null
  estado_facturas: string | null
  router: string | null
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

// ── Plan individual (BFF normalizado) ──
export interface PlanStat {
  nombre: string
  clientCount: number
  recaudo: number      // suma de precio_plan de clientes activos/gratis en este plan
  avgPrecio: number    // recaudo / clientCount
}

// ── Respuesta GET /api/plans ──
export interface PlansData {
  plans: PlanStat[]
  planMasPopular: string | null
  totalPlanes: number
  totalClientes: number
  totalRecaudo: number
  fetchedAt: string
}

export interface PlansResponse {
  success: true
  data: PlansData
  cached?: boolean
}

export type PlansApiResponse = PlansResponse | BffErrorResponse

// ── Zona individual (BFF normalizado) ──
export interface ZoneStat {
  nombre: string
  clientCount: number
  recaudo: number      // suma de precio_plan de clientes activos/gratis en esta zona
  avgPrecio: number    // recaudo / clientCount
}

// ── Respuesta GET /api/zones ──
export interface ZonesData {
  zones: ZoneStat[]
  totalZonas: number
  totalClientes: number
  zonaConMasClientes: string | null
  fetchedAt: string
}

export interface ZonesResponse {
  success: true
  data: ZonesData
  cached?: boolean
}

export type ZonesApiResponse = ZonesResponse | BffErrorResponse

// ── Cliente en mora (BFF normalizado) ──
export interface MoraClient {
  nombre: string
  totalMora: number       // suma de total_cobrado de facturas vencidas
  diasMaxAtraso: number   // máximo días de atraso entre sus facturas vencidas
  facturaCount: number    // número de facturas vencidas
}

// ── Respuesta GET /api/mora ──
export interface MoraData {
  clientesEnMora: MoraClient[]
  totalClientesEnMora: number
  totalMontoMora: number
  fetchedAt: string
}

export interface MoraResponse {
  success: true
  data: MoraData
  cached?: boolean
}

export type MoraApiResponse = MoraResponse | BffErrorResponse

// ── Distribución de antigüedad ──
export interface AntiguedadDistribution {
  menosDe6Meses: number   // < 180 días
  de6A12Meses: number     // 180–364 días
  de1A2Anos: number       // 365–729 días
  masDe2Anos: number      // >= 730 días
}

// ── Respuesta GET /api/antiguedad ──
export interface AntiguedadData {
  avgDays: number
  avgLabel: string                    // e.g. "1 año 3 meses"
  distribution: AntiguedadDistribution
  totalClientes: number
  fetchedAt: string
}

export interface AntiguedadResponse {
  success: true
  data: AntiguedadData
  cached?: boolean
}

export type AntiguedadApiResponse = AntiguedadResponse | BffErrorResponse

// ── Accionista individual ──
export interface InversionAccionista {
  key: string
  nombre: string
  saldoInicial: number
  total: number
  porcentaje: number
}

// ── Transacción de inversión ──
export interface InversionTransaccion {
  fecha: string
  nelson?: number
  arley?: number
  jaime?: number
  juanCamilo?: number
  observacion: string
}

// ── Respuesta GET /api/inversion ──
export interface InversionData {
  accionistas: InversionAccionista[]
  transacciones: InversionTransaccion[]
  totalGeneral: number
  fetchedAt: string
}

export interface InversionResponse {
  success: true
  data: InversionData
  cached?: boolean
}

export type InversionApiResponse = InversionResponse | BffErrorResponse

// ── Cobranza ──
export interface CobranzaData {
  tasaCobranzaMes: number        // % facturas emitidas este mes ya cobradas
  tasaCobranzaGeneral: number    // % histórico total cobradas
  avgPaymentDays: number         // días promedio entre emisión y pago
  facturasPagadasMes: number
  facturasEmitidasMes: number
  facturasPagadasTotal: number
  facturasEmitidasTotal: number
  fetchedAt: string
}

export interface CobranzaResponse {
  success: true
  data: CobranzaData
  cached?: boolean
}

export type CobranzaApiResponse = CobranzaResponse | BffErrorResponse
