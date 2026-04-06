# BEEPYRED Dashboard

## What This Is

Dashboard administrativo para BEEPYRED, empresa proveedora de internet. Conectado en tiempo real a la API de Wisphub, permite al administrador ver el estado completo de la empresa: clientes activos, conexiones en vivo, deuda pendiente e ingresos del mes. Todo en una sola pantalla, con diseño oscuro y moderno.

## Core Value

El administrador puede ver de un vistazo el estado real de la empresa — clientes, red y finanzas — sin abrir Wisphub directamente.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] El administrador puede ver el total de clientes activos en tiempo real
- [ ] El administrador puede ver cuántos clientes están conectados ahora mismo
- [ ] El administrador puede ver el total de deuda pendiente (clientes morosos)
- [ ] El administrador puede ver los ingresos del mes actual
- [ ] El administrador puede ver el listado de facturas pendientes de pago
- [ ] El administrador puede actualizar todos los datos con un botón de recarga manual
- [ ] La interfaz tiene diseño dark mode, moderno y profesional
- [ ] El sistema se conecta a Wisphub mediante API con credenciales del administrador

### Out of Scope

- Acceso multi-usuario con roles — solo se necesita un administrador por ahora
- Portal para clientes — los clientes no acceden al dashboard
- Envío de recordatorios de pago — solo se visualizan, no se gestionan desde aquí
- Registro de pagos — no se modifican datos en Wisphub desde el dashboard

## Context

- **Plataforma Wisphub**: Sistema de gestión para ISPs (Internet Service Providers). Tiene API REST con autenticación por token. El administrador ya cuenta con credenciales de acceso.
- **Empresa**: BEEPYRED es un proveedor de internet. Usa Wisphub como sistema central de gestión de clientes y facturación.
- **Usuario único**: Solo el administrador usa el dashboard. No hay necesidad de autenticación compleja ni múltiples roles.
- **Actualización manual**: El administrador prefiere controlar cuándo se actualiza la información, no refresco automático.

## Constraints

- **Integración**: Wisphub API — toda la data proviene de esta fuente, sin base de datos propia
- **Usuario**: Administrador único — sin sistema de autenticación multi-usuario
- **UI**: Dark mode obligatorio — preferencia del administrador

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Solo lectura desde Wisphub | No modificar datos en producción desde el dashboard | — Pending |
| Actualización manual | El administrador prefiere controlar el momento de recarga | — Pending |
| Administrador único | No se requiere gestión de usuarios en v1 | — Pending |

## Evolution

Este documento evoluciona en cada transición de fase y al cerrar milestones.

**Después de cada fase** (via `/gsd-transition`):
1. ¿Requisitos invalidados? → Mover a Out of Scope con razón
2. ¿Requisitos validados? → Mover a Validated con referencia de fase
3. ¿Nuevos requisitos emergieron? → Agregar a Active
4. ¿Decisiones a registrar? → Agregar a Key Decisions
5. ¿"What This Is" sigue siendo preciso? → Actualizar si cambió

**Después de cada milestone** (via `/gsd-complete-milestone`):
1. Revisión completa de todas las secciones
2. Verificar Core Value — ¿sigue siendo la prioridad correcta?
3. Auditar Out of Scope — ¿las razones siguen siendo válidas?
4. Actualizar Context con el estado actual

---
*Last updated: 2026-04-06 after initialization*
