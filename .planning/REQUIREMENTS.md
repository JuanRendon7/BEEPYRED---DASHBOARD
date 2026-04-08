# Requirements: BEEPYRED Dashboard

**Defined:** 2026-04-06
**Core Value:** El administrador puede ver de un vistazo el estado real de la empresa — clientes, red y finanzas — sin abrir Wisphub directamente.

## v1 Requirements

### Integración API

- [ ] **API-01**: El sistema se conecta a Wisphub mediante token de API almacenado de forma segura en el servidor (nunca en el frontend)
- [ ] **API-02**: Todas las llamadas a Wisphub pasan por un proxy backend (Express) — el browser nunca llama a Wisphub directamente
- [ ] **API-03**: El sistema valida el shape de las respuestas de Wisphub y falla visiblemente si los datos no tienen el formato esperado

### Métricas Principales

- [ ] **MET-01**: El administrador puede ver el total de clientes activos en tiempo real
- [ ] **MET-02**: El administrador puede ver cuántos clientes están conectados ahora mismo
- [ ] **MET-03**: El administrador puede ver el total de deuda pendiente (clientes morosos)
- [ ] **MET-04**: El administrador puede ver los ingresos del mes actual

### Facturas

- [ ] **FAC-01**: El administrador puede ver el listado de facturas pendientes de pago
- [ ] **FAC-02**: La lista de facturas muestra: nombre del cliente, monto, y días de atraso

### Controles y UX

- [x] **UX-01**: El administrador puede actualizar todos los datos con un botón de recarga manual
- [ ] **UX-02**: El botón de recarga se deshabilita durante la carga y muestra estado de espera (cooldown para evitar rate limit)
- [x] **UX-03**: Cada sección muestra un indicador de carga (spinner/skeleton) mientras se obtienen los datos
- [ ] **UX-04**: Cada sección muestra un mensaje de error claro si la llamada a Wisphub falla
- [ ] **UX-05**: El dashboard muestra el timestamp de "última actualización" después de cada carga exitosa

### Diseño

- [ ] **UI-01**: La interfaz tiene diseño dark mode, moderno y profesional
- [ ] **UI-02**: Todos los colores están definidos como tokens/variables de diseño (no hardcodeados)

## v2 Requirements

### Métricas Avanzadas

- **ADV-01**: Desglose de deuda por antigüedad (30 / 60 / 90+ días vencidos)
- **ADV-02**: Lista de top 5-10 deudores por saldo pendiente
- **ADV-03**: Tendencia de ingresos mes a mes (sparkline)
- **ADV-04**: Ratio de clientes activos vs suspendidos
- **ADV-05**: Nuevos clientes registrados en el mes actual

### Exportación

- **EXP-01**: El administrador puede exportar snapshot del dashboard a PDF o CSV

## Out of Scope

| Feature | Razón |
|---------|-------|
| Multi-usuario con roles | Admin único — complejidad sin beneficio en v1 |
| Portal para clientes | Producto diferente al dashboard de admin |
| Envío de recordatorios de pago (SMS/email) | Wisphub ya lo maneja; solo lectura |
| Registro de pagos | No modificar datos en Wisphub desde el dashboard |
| Auto-refresh / polling | Admin prefiere control manual; riesgo de rate limit |
| Base de datos propia | Wisphub es la fuente de verdad — no duplicar |
| WebSockets / tiempo real push | Overkill para admin único con refresh manual |
| Analytics histórico | Requiere almacenar datos; diferir a v2+ |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Pending |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| MET-01 | Phase 2 | Pending |
| MET-02 | Phase 2 | Pending |
| MET-03 | Phase 2 | Pending |
| MET-04 | Phase 2 | Pending |
| FAC-01 | Phase 2 | Pending |
| FAC-02 | Phase 2 | Pending |
| UX-01 | Phase 2 | Complete |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 2 | Complete |
| UX-04 | Phase 2 | Pending |
| UX-05 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Phase 1: 5 requirements (API-01, API-02, API-03, UI-01, UI-02)
- Phase 2: 11 requirements (MET-01..04, FAC-01..02, UX-01..05)
- Phase 3: 0 new requirements (cross-cutting quality pass — all 16 requirements verified end-to-end)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation — traceability finalized*
