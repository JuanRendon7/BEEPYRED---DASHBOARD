import { z } from 'zod'

// ── Client record schema ──
// Field names and types confirmed from server/exploration/02-api-shapes.md (real API responses)
// IMPORTANT: saldo is a STRING in client records ("0.00"), not a number
export const WisphubClientSchema = z.object({
  id_servicio: z.number(),
  nombre: z.string(),
  estado: z.string(),           // "Activo" | "Suspendido" | "Cancelado" — confirmed from real response
  saldo: z.string(),            // STRING ("0.00") — confirmed from exploration; use parseFloat() to operate
  precio_plan: z.string(),      // STRING ("63000.00") — confirmed from exploration
  estado_facturas: z.string().optional(),
  fecha_instalacion: z.string().optional(),  // "DD/MM/YYYY HH:MM:SS" — confirmado de API real
  plan_internet: z.object({
    id: z.number(),
    nombre: z.string(),
  }).nullable(),
  zona: z.object({
    id: z.number(),
    nombre: z.string(),
  }).nullable(),
  router: z.object({
    id: z.number(),
    nombre: z.string(),
    falla_general: z.boolean(),
    falla_general_descripcion: z.string(),
  }).nullable(),
})

// ── Invoice/factura record schema ──
// Campos confirmados del debug de API real. saldo y total son numbers en facturas.
// articulos: z.any() para no romper validación por campos internos variables
export const WisphubInvoiceSchema = z.object({
  id_factura: z.number(),
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  fecha_pago: z.string().nullable(),         // null si no pagada
  estado: z.string(),                        // "Pagada" | "Pendiente de Pago" | "Cancelada"
  total: z.number(),
  saldo: z.number(),                         // 0 si pagada, > 0 si pendiente
  total_cobrado: z.number(),
  cliente: z.object({
    nombre: z.string(),
    email: z.string().optional(),
    telefono: z.string().optional(),
  }),
  articulos: z.array(z.any()).optional(),    // acceder via casteo: (raw as any).articulos
})

// ── Paginated list wrapper (DRF pagination — confirmed during exploration) ──
export const WisphubClientListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(WisphubClientSchema),
})

export const WisphubInvoiceListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(WisphubInvoiceSchema),
})

// ── TypeScript types derived from schemas ──
export type WisphubClient = z.infer<typeof WisphubClientSchema>
export type WisphubInvoice = z.infer<typeof WisphubInvoiceSchema>
