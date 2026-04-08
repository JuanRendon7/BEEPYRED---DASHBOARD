# Roadmap: BEEPYRED Dashboard

## Overview

The BEEPYRED Dashboard is built in three tight phases ordered by technical dependency. Phase 1 establishes the only layer everything else depends on: a working, authenticated BFF proxy to Wisphub with verified API shapes and a stable design system. Phase 2 builds all visible features on top of that foundation — every metric card, the invoice list, every UX control, and every loading/error state. Phase 3 verifies the assembled product end-to-end, resolves edge cases found during integration, and confirms the dashboard is production-ready. Nothing in Phase 2 can start until Phase 1's API unknowns are resolved; nothing in Phase 3 can start until the full UI is assembled.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - BFF proxy, Wisphub API validation, and design system
- [ ] **Phase 2: Core Dashboard** - All metrics, invoices, and UX controls
- [ ] **Phase 3: Polish & Production** - End-to-end verification, edge cases, production readiness

## Phase Details

### Phase 1: Foundation
**Goal**: The admin has a working, authenticated proxy to Wisphub with verified API shapes and a complete design system ready for component development
**Depends on**: Nothing (first phase)
**Requirements**: API-01, API-02, API-03, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. The Express BFF proxy runs locally, calls Wisphub with the token from env vars, and returns real data at `GET /api/metrics` and `GET /api/invoices` — the browser never calls Wisphub directly
  2. Raw Wisphub responses have been inspected: pagination behavior, field names for debt/revenue/active-status, and rate limit behavior are documented and handled in the BFF
  3. Zod validation schemas are in place at the BFF boundary — if Wisphub returns an unexpected shape, the proxy returns a structured error instead of silent garbage
  4. The Tailwind config defines all color tokens (including BEEPYRED red and all dark mode shades) — no hardcoded hex values exist anywhere in the project
  5. The base layout shell renders in dark mode with correct token-driven colors verifiable in the browser
**Plans**: TBD
**UI hint**: yes

### Phase 2: Core Dashboard
**Goal**: The admin can open the dashboard and see all four metric cards, the pending invoices list, and every UX control — with correct loading states, error states, and a working refresh button
**Depends on**: Phase 1
**Requirements**: MET-01, MET-02, MET-03, MET-04, FAC-01, FAC-02, UX-01, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. The admin can see four metric cards on screen: total active clients, clients connected now, total pending debt, and monthly revenue — all populated with real Wisphub data
  2. The pending invoices list displays client name, amount owed, and days overdue for every pending invoice returned by Wisphub
  3. Clicking the refresh button updates all sections simultaneously; the button disables and shows a loading state during the fetch, then re-enables after a cooldown period (rate-limit protection)
  4. Each section (metric cards and invoice list independently) shows a skeleton or spinner while its data is loading — no section blocks another
  5. Each section shows an inline error message if its Wisphub call fails, and the timestamp "last updated" appears after every successful load
**Plans**: 5 planes
Plans:
- [x] 02-01-PLAN.md — Design system: Tailwind v3.4.19 + PostCSS + shadcn/ui init + tokens BEEPYRED
- [x] 02-02-PLAN.md — API layer: tipos TypeScript BFF + hooks TanStack Query v5
- [ ] 02-03-PLAN.md — Layout + MetricCard: DashboardLayout + MetricCard + MetricsGrid
- [ ] 02-04-PLAN.md — InvoiceList: tabla de facturas con días de atraso + estados UX
- [ ] 02-05-PLAN.md — Refresh button + timestamp + wiring final en App.tsx
**UI hint**: yes

### Phase 3: Polish & Production
**Goal**: The assembled dashboard is production-ready — all edge cases handled, dark mode verified across every component, and the full refresh/error/loading flow validated end to end
**Depends on**: Phase 2
**Requirements**: (none new — cross-cutting quality pass over all 16 v1 requirements)
**Success Criteria** (what must be TRUE):
  1. Simulating a Wisphub failure (network off or wrong token) shows a clear error message in every affected section — no blank panels, no silent zeros
  2. Every component renders correctly in dark mode: no light backgrounds, no invisible text, no hardcoded colors that bypass the token system
  3. The full refresh cycle (click refresh → skeletons appear → data loads → timestamp updates → button re-enables) completes without visual glitches or race conditions
  4. The dashboard layout is usable on the admin's typical screen size without horizontal scrolling or broken grid
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Core Dashboard | 1/5 | In Progress|  |
| 3. Polish & Production | 0/? | Not started | - |
