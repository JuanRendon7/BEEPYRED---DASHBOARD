---
plan: 02-01
phase: 02-core-dashboard
status: complete
completed_at: 2026-04-07
subsystem: design-system
tags: [tailwind, shadcn, dark-mode, tokens]
dependency_graph:
  requires: []
  provides: [tailwind-tokens, shadcn-components, dark-mode]
  affects: [02-02, 02-03, 02-04, 02-05]
tech_stack:
  added: [tailwindcss@3.4.19, postcss@8.4.47, autoprefixer@10.4.20, clsx@2.1.1, tailwind-merge@2.5.4, class-variance-authority@0.7.1, "@radix-ui/react-slot"]
  patterns: [css-variables, dark-mode-class, design-tokens]
key_files:
  created:
    - client/tailwind.config.ts
    - client/postcss.config.cjs
    - client/components.json
    - client/src/lib/utils.ts
    - client/src/components/ui/button.tsx
    - client/src/components/ui/badge.tsx
  modified:
    - client/src/index.css
    - client/index.html
    - client/package.json
decisions:
  - "tailwindcss@3.4.19 pinned sin caret para garantizar compatibilidad con shadcn/ui"
  - "postcss.config.cjs (extension .cjs) requerida porque package.json tiene type:module"
  - "shadcn v4 cambio API — components.json creado manualmente en lugar de --base-color flag"
  - "baseColor zinc alineado con tokens D-03/D-04/D-05 zinc del design system"
metrics:
  duration: 25min
  completed_date: 2026-04-07
  tasks: 2
  files: 9
---

# Phase 02 Plan 01: Design System Summary

## One-liner
Tailwind v3.4.19 con tokens BEEPYRED D-01 a D-07 + shadcn/ui zinc dark mode configurados como base visual del dashboard.

## What was built

- **Tailwind CSS v3.4.19** instalado exacto (sin caret), PostCSS + autoprefixer configurados
- **postcss.config.cjs** en formato CJS con extension `.cjs` (requerida por `"type": "module"` en package.json)
- **tailwind.config.ts** con tokens de color completos D-01 a D-07:
  - brand.DEFAULT `#F5A800` (D-01 — gold amber del logo)
  - page `#0A0A0A` (D-02 — fondo near-black)
  - surface `#18181B` (D-03 — zinc-900 para cards)
  - border `#27272A` (D-04 — zinc-800)
  - text.primary `#FFFFFF`, text.secondary `#A1A1AA`, text.muted `#71717A` (D-05)
  - error `#EF4444` (D-06 — red-500)
  - darkMode: 'class'
- **index.html** con `class="dark"` en `<html>` — activa dark mode global
- **index.css** con `@tailwind` directives + `@layer base` con `bg-page` y `text-text-primary`
- **components.json** creado manualmente con baseColor zinc (shadcn v4 cambio de API — no existe `--base-color` flag)
- **src/lib/utils.ts** con función `cn()` usando clsx + tailwind-merge
- **src/components/ui/button.tsx** y **badge.tsx** instalados como prueba de humo
- `npm run build` pasa exitosamente en 872ms

## Artifacts

- `client/tailwind.config.ts` — tokens D-01 a D-07 + darkMode class
- `client/postcss.config.cjs` — PostCSS con tailwindcss + autoprefixer (formato CJS)
- `client/components.json` — shadcn config con zinc, CSS variables, aliases @/components y @/lib
- `client/src/lib/utils.ts` — funcion cn() para combinar clases Tailwind
- `client/src/components/ui/button.tsx` — componente Button con variantes
- `client/src/components/ui/badge.tsx` — componente Badge con variantes

## Decisions

- **tailwindcss@3.4.19 exacto (sin caret):** Versión v4 de Tailwind es incompatible con shadcn/ui — se pineó para evitar upgrades automáticos
- **postcss.config.cjs:** El proyecto usa `"type": "module"` en package.json. PostCSS config usa `module.exports` (CJS) — necesita extension `.cjs` para que Node no lo trate como ESM
- **components.json manual:** shadcn CLI v4.2.0 cambio la API — elimino `--base-color` flag y usa sistema de presets. Se creó `components.json` manualmente con baseColor zinc para mantener alineamiento con los tokens D-03/D-04/D-05
- **baseColor zinc:** Alineado con tokens zinc del design system (surface #18181B = zinc-900, border #27272A = zinc-800)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] postcss.config.js incompatible con ESM**
- **Found during:** Task 1 — verificacion final con `npm run build`
- **Issue:** `postcss.config.js` usa `module.exports` (CommonJS) pero `package.json` tiene `"type": "module"`, haciendo que Node.js lo trate como ESM y falle con `ReferenceError: module is not defined`
- **Fix:** Renombrado a `postcss.config.cjs` — Node reconoce la extension `.cjs` como CommonJS sin importar el `type` del package.json
- **Files modified:** `client/postcss.config.cjs` (antes `postcss.config.js`)
- **Commit:** f00a913

**2. [Rule 3 - Blocking] shadcn v4 cambio de API en `--base-color`**
- **Found during:** Task 2 — `npx shadcn@latest init --base-color zinc` fallo con "unknown option"
- **Issue:** shadcn CLI v4.2.0 no tiene flag `--base-color`. Usa sistema de presets interactivos (Nova, Vega, Maia, etc.) en lugar de base colors
- **Fix:** `components.json` creado manualmente con estructura correcta incluyendo `"baseColor": "zinc"`. Dependencias instaladas directamente con npm. Componentes agregados con `npx shadcn@latest add button badge --yes` (el CLI si puede agregar componentes con `components.json` ya presente)
- **Files modified:** `client/components.json`
- **Commit:** f00a913

**3. [Rule 3 - Blocking] shadcn v4 crea archivos en `@/` literal en lugar de resolver alias**
- **Found during:** Task 2 — despues de `npx shadcn@latest add button badge`, archivos creados en `client/@/components/ui/` en lugar de `client/src/components/ui/`
- **Issue:** Bug conocido de shadcn v4 con proyectos Vite — el CLI no resuelve el alias `@` correctamente en Windows
- **Fix:** Archivos copiados a `client/src/components/ui/`, directorio erroneo `client/@` eliminado
- **Files modified:** `client/src/components/ui/button.tsx`, `client/src/components/ui/badge.tsx`
- **Commit:** f00a913

## Must-haves Verified

- [x] Tailwind v3 genera CSS correctamente — `npm run build` produce 7.70 kB de CSS
- [x] brand.DEFAULT = #F5A800 (D-01)
- [x] page = #0A0A0A (D-02)
- [x] surface = #18181B (D-03)
- [x] border = #27272A (D-04)
- [x] text.secondary = #A1A1AA (D-05)
- [x] error = #EF4444 (D-06)
- [x] darkMode: 'class' configurado
- [x] class="dark" en index.html activa dark mode
- [x] shadcn/ui init produce components.json con zinc
- [x] Button importable desde @/components/ui/button
- [x] Badge importable desde @/components/ui/badge
- [x] cn() disponible en @/lib/utils
- [x] TypeScript compila sin errores (npx tsc --noEmit)
- [x] npm run build pasa sin errores

## Known Stubs

Ninguno — este plan establece infraestructura pura sin datos ni UI de aplicacion.

## Self-Check: PASSED
