---
plan: 02-03
phase: 02-core-dashboard
status: complete
completed_at: 2026-04-07
subsystem: frontend-components
tags: [layout, metrics, skeleton, dark-mode, tailwind]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [dashboard-layout, metric-cards, metrics-grid]
  affects: [02-04, 02-05]
tech_stack:
  added: []
  patterns: [sticky-header, skeleton-loading, error-boundary-inline, intl-format-cop]
key_files:
  created:
    - client/src/components/layout/DashboardLayout.tsx
    - client/src/components/metrics/MetricCard.tsx
    - client/src/components/metrics/MetricCardSkeleton.tsx
    - client/src/components/metrics/MetricsGrid.tsx
  modified:
    - client/src/App.tsx
decisions:
  - "connectedClients muestra N/D hardcoded en MetricsGrid — MET-02 no disponible en Wisphub"
  - "formatCOP usa Intl.NumberFormat con locale es-CO — produce formato $ 9.551.300"
  - "MetricCard recibe value como string pre-formateada — no formatea internamente"
metrics:
  duration_min: 15
  completed_date: 2026-04-07
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 02 Plan 03: Layout + MetricCards Summary

## One-liner

DashboardLayout sticky header (D-09) + 4 MetricCards con skeleton/error states y formato COP es-CO.

## What Was Built

- **DashboardLayout.tsx** — shell de página con header `sticky top-0 z-50` (decisión locked D-09), logo BEEPYRED con fallback `onError`, slot `#header-actions` para RefreshButton (Plan 05)
- **MetricCard.tsx** — tarjeta de métrica individual con props tipadas (`LucideIcon`, `value: string`, `iconClassName`); usa tokens Tailwind sin hex hardcoded
- **MetricCardSkeleton.tsx** — placeholder `animate-pulse` con dimensiones que coinciden con MetricCard real
- **MetricsGrid.tsx** — grid de 4 tarjetas conectado a `useMetrics()`; maneja loading (4 skeletons), error (mensaje inline), datos, y null; `connectedClients` siempre muestra "N/D" hardcoded; `formatCOP` con locale `es-CO`
- **App.tsx** — actualizado para usar `DashboardLayout` + `MetricsGrid` + placeholder para InvoiceList (Plan 04)

## Must-haves Verified

- [x] 4 tarjetas de métricas visibles cuando hay datos
- [x] connectedClients muestra "N/D" — nunca un número
- [x] Skeletons mientras carga (`isLoading`)
- [x] Mensaje de error inline si `useMetrics` falla (`isError`)
- [x] Formato colombiano: `$ 9.551.300` via `Intl.NumberFormat('es-CO')`
- [x] Header sticky (`sticky top-0 z-50`) — decisión D-09
- [x] TypeScript limpio (`npx tsc --noEmit` sin errores)

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito.

## Threat Surface Scan

Revisados los archivos creados/modificados contra el threat model del plan:

| Threat | Disposición | Verificado |
|--------|-------------|------------|
| T-02-08: XSS via data render | mitigate | React escapa strings en JSX automáticamente — no se usa `dangerouslySetInnerHTML` |
| T-02-07: error.message disclosure | accept | Solo visible para el admin único |
| T-02-09: imagen onError silenciosa | accept | Fallback oculta imagen rota — solo UX |

No se detectaron nuevas superficies de ataque fuera del threat model.

## Known Stubs

- **Sección "Facturas pendientes" en App.tsx** — placeholder de texto "Lista de facturas — próximo plan". Será reemplazado por InvoiceList en Plan 04. Intencional y documentado.
- **`#header-actions` div en DashboardLayout** — slot vacío para RefreshButton. Será poblado en Plan 05. Intencional.
