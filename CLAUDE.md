<!-- GSD:project-start source:PROJECT.md -->
## Project

**BEEPYRED Dashboard**

Dashboard administrativo para BEEPYRED, empresa proveedora de internet. Conectado en tiempo real a la API de Wisphub, permite al administrador ver el estado completo de la empresa: clientes activos, conexiones en vivo, deuda pendiente e ingresos del mes. Todo en una sola pantalla, con diseño oscuro y moderno.

**Core Value:** El administrador puede ver de un vistazo el estado real de la empresa — clientes, red y finanzas — sin abrir Wisphub directamente.

### Constraints

- **Integración**: Wisphub API — toda la data proviene de esta fuente, sin base de datos propia
- **Usuario**: Administrador único — sin sistema de autenticación multi-usuario
- **UI**: Dark mode obligatorio — preferencia del administrador
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Stack Principal
### Frontend
| Tecnología | Versión | Rol | Rationale |
|------------|---------|-----|-----------|
| **React** | 18.3 | UI framework | Estándar para dashboards; ecosistema maduro; dark mode fácil con Tailwind |
| **TypeScript** | 5.5 | Tipado | Atrapa errores de API shapes en tiempo de compilación — crítico cuando Wisphub puede devolver campos inesperados |
| **Vite** | 5.x | Build tool | Desarrollo rápido, HMR instantáneo; no necesita SSR para admin único |
### Estilos
| Tecnología | Versión | Rol | Rationale |
|------------|---------|-----|-----------|
| **Tailwind CSS** | 3.4 | Utilidades CSS | Dark mode con `dark:` classes; consistencia sin CSS custom; fácil theming |
| **shadcn/ui** | Latest | Componentes | Componentes viven en tu repo (los posees); dark mode nativo; accesibilidad incluida |
| **Lucide React** | Latest | Iconos | Librería estándar con shadcn/ui; tree-shakeable |
### Datos y API
| Tecnología | Versión | Rol | Rationale |
|------------|---------|-----|-----------|
| **TanStack Query** | v5 | Data fetching / cache | `refetch()` manual mapea perfecto al botón de refresh; maneja loading/error/success states; no polling automático |
| **Axios** | 1.7 | HTTP client | Interceptors para inyectar token Wisphub en cada request; mejor manejo de errores que fetch nativo |
### Backend (Proxy obligatorio)
| Tecnología | Versión | Rol | Rationale |
|------------|---------|-----|-----------|
| **Node.js + Express** | 20 LTS + 4.x | API proxy | Mantiene el token Wisphub fuera del browser; normaliza respuestas; single endpoint para el frontend |
### Estado
| Tecnología | Rol | Rationale |
|------------|-----|-----------|
| **React Context** | Estado global | Suficiente para admin único, solo lectura; no necesitas Redux ni Zustand |
## Estructura de Proyecto
## Lo que NO usar y por qué
| Tecnología | Por qué no |
|------------|------------|
| **Next.js** | Overhead de SSR innecesario para admin único; complejidad sin beneficio |
| **Create React App** | Deprecado desde 2023 |
| **MUI / Ant Design** | Dark mode difícil de personalizar; estilos pesados |
| **Redux / RTK Query** | Overkill para dashboard de solo lectura con admin único |
| **styled-components** | Conflicta con Tailwind; complejidad innecesaria |
| **WebSockets** | Los requisitos especifican refresh manual únicamente |
| **Prisma / cualquier ORM** | No hay base de datos propia — Wisphub es la fuente de verdad |
## Variables de Entorno Requeridas
# server/.env (NUNCA en git)
# client/.env (solo config de desarrollo)
## Niveles de Confianza
| Área | Confianza | Nota |
|------|-----------|------|
| React + Vite + TypeScript | ALTA | Stack estándar 2024-2025 |
| TanStack Query v5 | ALTA | Estable, widely adopted |
| shadcn/ui + Tailwind | ALTA | Dominante en dashboards modernos |
| Express como proxy | ALTA | Patrón establecido |
| Wisphub API shape | BAJA | Verificar contra docs reales en Fase 1 |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
