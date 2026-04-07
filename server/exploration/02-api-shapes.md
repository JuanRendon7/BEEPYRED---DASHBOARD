# Wisphub API Shapes — Confirmed
Date: 2026-04-07

## Base URL
Confirmed: `https://api.wisphub.io`
Note: La baseURL en server/.env debe ser `https://api.wisphub.io` (sin `/api/` al final).
El cliente Axios concatena con `combineURLs`, así que cada endpoint usa el path completo `/api/...`.

## /api/clientes/ — Client list
HTTP Method: GET
Pagination: DRF estándar — `count`, `next`, `previous`, `results` ✓
Max page size: 300 funciona (no probado, pero `limit` acepta cualquier valor)
Total clientes en la cuenta: 683

### IMPORTANTE — Filtro `estado=Activo` NO funciona
El query param `?estado=Activo` retornó `count: 0` aunque los clientes sí tienen `estado: "Activo"`.
**Estrategia para MET-01 (clientes activos):** Fetch all + filter en BFF por `estado === 'Activo'`.
Alternativa futura: investigar si hay un param diferente (ej. `status`, `activo=true`).

### Client record fields (confirmed from real response):
- `id_servicio`: number — ID único del servicio
- `nombre`: string — nombre completo del cliente
- `usuario`: string — username interno (formato: `cedula-nombre@beepyred`)
- `estado`: string — valores observados: `"Activo"` (confirmar: "Suspendido", "Cancelado")
- `saldo`: string — deuda pendiente en string monetario, e.g. `"0.00"` (parseFloat para operar)
- `precio_plan`: string — precio mensual del plan en string, e.g. `"63000.00"`
- `estado_facturas`: string — e.g. `"Pagadas"` (valores: "Pagadas", "Pendientes", "Morosa"?)
- `fecha_corte`: string — fecha próximo corte, formato `"d/mm/yyyy"` e.g. `"5/05/2026"`
- `plan_internet`: `{ id: number, nombre: string }` — plan contratado
- `zona`: `{ id: number, nombre: string }` — zona de red
- `router`: `{ id: number, nombre: string, falla_general: boolean, falla_general_descripcion: string }`
- `sectorial`: null | object
- `tecnico`: `{ id: number, nombre: string }` | null

### Estado values observed:
- `"Activo"` — cliente activo y pagando (mayoría de los 683)
- (otros valores como "Suspendido", "Cancelado" inferidos, no confirmados aún)

## /api/facturas/ — Invoices
HTTP Method: GET (POST es para crear, no listar — confirmado con 400)
Pagination: DRF estándar — `count`, `next`, `previous`, `results` ✓

### Invoice record fields (confirmed):
- `id_factura`: number — ID único
- `fecha_emision`: string — formato ISO date `"YYYY-MM-DD"`
- `fecha_vencimiento`: string — formato ISO date `"YYYY-MM-DD"`
- `fecha_pago`: string | null — datetime ISO con timezone `"YYYY-MM-DDTHH:mm:ss-05:00"`, null si no pagada
- `estado`: string — `"Pagada"` confirmado; otros probables: `"Pendiente"`, `"Vencida"`, `"Cancelada"`
- `total`: number — total en pesos (número, no string)
- `saldo`: number — monto pendiente (0 si pagada)
- `sub_total`: number
- `descuento`: number
- `total_cobrado`: number — lo que realmente se cobró
- `cliente`: `{ usuario, nombre, email, cedula, direccion, localidad, telefono, rfc }` — objeto anidado
- `articulos`: array de `{ id, cantidad, descripcion, precio, servicio: { id_servicio } }`
- `forma_pago`: `{ id: number, nombre: string }` | null
- `cajero`: `{ id: number, nombre: string }` | null
- `zona`: `{ id: number, nombre: string }`

### Para facturas PENDIENTES (MET-03 — deuda pendiente):
Filtrar por `estado != "Pagada"` o por `saldo > 0`.
Endpoint probable: `GET /api/facturas/?estado=Pendiente` o `?estado=Morosa` — **NO confirmado todavía**.
Alternativa segura: fetch all + filter en BFF por `saldo > 0`.

### Para ingresos del mes (MET-04 — ingresos mensuales):
Filter por `fecha_pago` en el mes actual + `estado=Pagada`.
Endpoint probable: `GET /api/facturas/?fecha_pago__gte=YYYY-MM-01&fecha_pago__lte=YYYY-MM-31`
**No confirmado** — usar fetch all + filter en BFF como fallback.

## MET-02 Investigation — Clientes conectados en este momento
- `estado=Conectado` filter: **NO funciona** — retorna count: 0
- `online=true` filter: **NO funciona** — retorna 683 (mismo total sin filtro)
- `router.falla_general`: bool disponible en cada cliente — indica si hay falla general en el nodo, NO si el cliente individual está conectado
- **Conclusión: No existe endpoint confirmado para clientes conectados en tiempo real.**
- **Estrategia para MET-02:** Mostrar "N/D" en el dashboard o explorar `/api/clientes/{id}/saldo/` en lote (inviable para 683 clientes). Phase 2 mostrará esta métrica como no disponible.

## /api/clientes/{id}/saldo/ — Saldo individual
Fields confirmed:
- `saldo`: number — deuda del cliente
- `facturas`: array — facturas pendientes del cliente
- `estado`: string — estado actual del cliente
- `router`: `{ id, nombre, ip, falla_general, falla_general_descripcion }`
- `nombre`: string
- `username`: string
- `url_pago`: string — URL de pago para el cliente

## Surprises vs RESEARCH.md
1. **Base URL**: `.io` (no `.net` ni `.app`)
2. **`estado=Activo` filter no funciona** — inesperado. BFF debe filtrar en memoria.
3. **`online=true` no filtra** — MET-02 no disponible vía API
4. **`saldo` en clientes es STRING** (`"0.00"`), pero en facturas es NUMBER (`0`). Requiere parseFloat en schemas.
5. **`cliente` en facturas es objeto anidado** — el nombre del cliente está en `factura.cliente.nombre`.
6. **POST /api/facturas/ crea facturas** — confirmado que GET es para listar.

## Confirmed for Zod Schemas

### WisphubClientSchema (mínimo para dashboard):
```
id_servicio: z.number()
nombre: z.string()
estado: z.string()
saldo: z.string()           // ← STRING, no number
precio_plan: z.string()
estado_facturas: z.string().optional()
plan_internet: z.object({ id: z.number(), nombre: z.string() }).nullable()
zona: z.object({ id: z.number(), nombre: z.string() }).nullable()
router: z.object({
  id: z.number(),
  nombre: z.string(),
  falla_general: z.boolean(),
  falla_general_descripcion: z.string()
}).nullable()
```

### WisphubInvoiceSchema (mínimo para dashboard):
```
id_factura: z.number()
fecha_emision: z.string()
fecha_vencimiento: z.string()
fecha_pago: z.string().nullable()
estado: z.string()
total: z.number()           // ← NUMBER
saldo: z.number()           // ← NUMBER
total_cobrado: z.number()
cliente: z.object({
  nombre: z.string(),
  email: z.string().optional(),
  telefono: z.string().optional()
})
```
