---
quick_id: 260407-ve0
status: complete
completed_at: 2026-04-08
---

# Summary: 260407-ve0 — Drawer panel lateral de clientes

## One-liner
Drawer desde la derecha al hacer click en "Clientes activos" o "Clientes suspendidos".

## What was built
- server/src/routes/clients.ts — GET /api/clients con cache 30s, saldo como number
- client/src/types/api.ts — BffClient, ClientsData, ClientsResponse
- client/src/lib/api.ts — fetchClients()
- client/src/hooks/useClients.ts — TanStack Query v5
- client/src/components/metrics/ClientsDrawer.tsx — panel fixed z-40, overlay, tabla COP
- client/src/components/metrics/MetricCard.tsx — prop onClick opcional
- client/src/components/metrics/MetricsGrid.tsx — drawerEstado state

## User verification
Aprobado visualmente por el usuario en 2026-04-08.
