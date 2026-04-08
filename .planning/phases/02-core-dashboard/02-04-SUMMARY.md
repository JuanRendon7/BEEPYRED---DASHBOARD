---
plan: 02-04
phase: 02-core-dashboard
status: complete
completed_at: 2026-04-07
subsystem: invoices-ui
tags: [invoices, filter, days-overdue, cop-format, skeleton]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [InvoiceList, InvoiceRow, InvoiceListSkeleton]
  affects: [App.tsx]
tech_stack:
  added: []
  patterns: [Intl.NumberFormat es-CO, date-local-parse, TanStack Query consumer]
key_files:
  created:
    - client/src/components/invoices/InvoiceRow.tsx
    - client/src/components/invoices/InvoiceListSkeleton.tsx
    - client/src/components/invoices/InvoiceList.tsx
  modified:
    - client/src/App.tsx
decisions:
  - "Filtro primario saldo > 0 (no por campo estado) — el saldo es la fuente de verdad para deuda pendiente en Wisphub"
  - "Parseo de fecha local via split('-').map(Number) para evitar off-by-one por timezone UTC"
  - "calcularDiasAtraso exportada para facilitar testing unitario en planes futuros"
metrics:
  duration_minutes: 15
  tasks_completed: 2
  files_created: 3
  files_modified: 1
requirements: [FAC-01, FAC-02, UX-03, UX-04]
---

# Phase 02 Plan 04: InvoiceList Summary

## One-liner
Lista de facturas con filtro saldo > 0, días de atraso calculados por parseo de fecha local, skeleton/error/empty states, y formato COP con Intl.NumberFormat es-CO.

## What was built

- **InvoiceRow.tsx**: Fila de tabla con `calcularDiasAtraso` exportada que parsea `fecha_vencimiento` como fecha local (evita off-by-one de timezone). Badge de color según días vencida: gris (0 dias = "Pendiente"), rojo/20 (1-30), rojo/30 (31-60), rojo/40 bold (>60). Monto formateado con `formatCOP` usando locale `es-CO`.
- **InvoiceListSkeleton.tsx**: 5 filas con `animate-pulse` para estado de carga.
- **InvoiceList.tsx**: Contenedor conectado a `useInvoices` con filtro `isPendingInvoice` (saldo > 0, FAC-01). Maneja 4 estados: loading (skeleton), error (inline con `border-error/30`), vacío ("Sin facturas pendientes"), y datos (tabla con header de columnas).
- **App.tsx**: Placeholder del Plan 03 reemplazado por `<InvoiceList />`. `MetricsGrid` y `DashboardLayout` preservados intactos.

## Must-haves verified

- [x] Admin ve nombre del cliente, monto y días de atraso por factura
- [x] Días calculados desde fecha_vencimiento hasta hoy (parseo local)
- [x] Filtro primario: saldo > 0 (FAC-01) — nunca muestra facturas con saldo = 0
- [x] Formato COP: `$ 9.551.300` via `Intl.NumberFormat('es-CO', { currency: 'COP' })`
- [x] Skeleton de 5 filas con animate-pulse mientras carga
- [x] Error inline con `border-error/30` si useInvoices falla
- [x] Mensaje vacío "Sin facturas pendientes — Todos los clientes están al día" si no hay pendientes
- [x] TypeScript sin errores (`npx tsc --noEmit` limpio)

## Commits

| Hash | Mensaje |
|------|---------|
| ebd32a9 | feat(02-04): InvoiceRow + InvoiceListSkeleton con días de atraso |
| 976fa05 | feat(02-04): InvoiceList con días de atraso y filtro saldo > 0 |

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito.

## Known Stubs

None - InvoiceList está conectado a `useInvoices` que llama al BFF real. Los datos fluyen desde Wisphub API.

## Threat Flags

T-02-10 (XSS via cliente.nombre): React escapa automáticamente strings en JSX — `invoice.cliente.nombre` se renderiza como texto, no HTML. No se usa `dangerouslySetInnerHTML`. Mitigado.

T-02-11 (fecha_vencimiento parsing): Si la fecha es malformada, `split('-').map(Number)` produce NaN y `new Date(NaN, NaN, NaN)` resulta en Invalid Date. La comparacion `vencimiento >= hoy` es false, por lo que `calcularDiasAtraso` devuelve 0 y el badge muestra "Pendiente". No crashea.

## Self-Check: PASSED

- FOUND: client/src/components/invoices/InvoiceRow.tsx
- FOUND: client/src/components/invoices/InvoiceListSkeleton.tsx
- FOUND: client/src/components/invoices/InvoiceList.tsx
- FOUND: commit ebd32a9
- FOUND: commit 976fa05
