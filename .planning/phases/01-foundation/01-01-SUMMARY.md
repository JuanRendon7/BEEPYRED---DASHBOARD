---
phase: 01-foundation
plan: 01
subsystem: scaffold
tags: [monorepo, react, vite, express, typescript, env-validation]
dependency_graph:
  requires: []
  provides:
    - client scaffold (React 18.3 + Vite 5 + TypeScript 5.5 strict)
    - server scaffold (Express 4 + TypeScript strict + env validation)
    - health endpoint GET /api/health
    - .gitignore protecting server/.env
    - concurrently dev script
  affects:
    - All subsequent plans depend on this monorepo structure
tech_stack:
  added:
    - react@18.3.1
    - react-dom@18.3.1
    - vite@5.4.21
    - "@vitejs/plugin-react@4.3.4"
    - typescript@5.9.3 (both client and server)
    - "@tanstack/react-query@5.96.2"
    - axios@1.14.0 (both client and server)
    - lucide-react@0.513.0
    - express@4.22.1
    - cors@2.8.6
    - dotenv@16.6.1
    - zod@3.25.76
    - tsx@4.21.0
    - concurrently@9.2.1
  patterns:
    - Vite proxy /api/* -> localhost:3001 (BFF pattern)
    - Zod env validation at Express startup (fail-fast)
    - CORS locked to http://localhost:5173 only
    - TypeScript strict mode in both packages
    - Path alias @/* -> ./src/* via vite.config.ts + tsconfig.app.json
key_files:
  created:
    - package.json (root concurrently dev script)
    - .gitignore (protects server/.env)
    - client/package.json (React 18.3 + Vite 5 + runtime deps)
    - client/vite.config.ts (Vite proxy + @/* alias)
    - client/tsconfig.app.json (TypeScript strict + path aliases)
    - client/tsconfig.json (project references)
    - client/tsconfig.node.json (Vite config TypeScript)
    - client/index.html (BEEPYRED Dashboard title + favicon)
    - client/src/main.tsx (React entry point)
    - client/src/App.tsx (minimal scaffold placeholder)
    - client/src/index.css (Tailwind directives placeholder)
    - client/.env.example (VITE_API_URL documented)
    - server/package.json (Express 4 + TypeScript deps)
    - server/tsconfig.json (TypeScript strict + CommonJS)
    - server/src/index.ts (Express entry + env validation + health endpoint)
    - server/.env.example (WISPHUB_TOKEN + WISPHUB_BASE_URL documented)
  modified: []
decisions:
  - "Express 4.22.1 installed (not v5) — npm default resolves to v5, pinned to ^4.21.2 in package.json"
  - "TypeScript 5.9.3 resolved (within ^5.5.0 range) — compatible with strict mode requirements"
  - "Added @types/node to client devDependencies — required for import path from path in vite.config.ts"
  - "tsconfig.app.json pattern used instead of monolithic tsconfig.json — Vite 5 scaffold generates this split; extended with @/* path alias"
  - "Vite dev server esbuild vulnerability (GHSA-67mh-4wv8-2f99) left unpatched — fix would require Vite v8 which violates version pin; affects dev only, not production"
metrics:
  duration: 8 minutes
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_created: 16
---

# Phase 01 Plan 01: Monorepo Scaffold Summary

**One-liner:** Full monorepo scaffold with React 18.3 + Vite 5 + Express 4 + TypeScript strict, Zod env validation at startup, and BFF proxy pattern.

## What Was Built

A complete monorepo foundation for the BEEPYRED Dashboard:

- **Root**: `package.json` with `concurrently` dev script launching both client and server
- **Client** (`/client`): React 18.3.1 + Vite 5.4.21 + TypeScript strict mode with proxy to BFF
- **Server** (`/server`): Express 4.22.1 + TypeScript strict + Zod env validation + health endpoint
- **Security**: `.gitignore` protecting `server/.env` before any credentials are written

## Exact Package Versions Installed

### Runtime Environment
- Node.js: v24.14.0
- npm: v11.9.0

### Client Dependencies
| Package | Pinned Range | Resolved Version |
|---------|-------------|-----------------|
| react | ^18.3.1 | 18.3.1 |
| react-dom | ^18.3.1 | 18.3.1 |
| vite | ^5.4.10 | 5.4.21 |
| typescript | ^5.5.0 | 5.9.3 |
| @tanstack/react-query | ^5.96.2 | 5.96.2 |
| axios | ^1.14.0 | 1.14.0 |
| lucide-react | ^0.513.0 | 0.513.0 |
| @vitejs/plugin-react | ^4.3.4 | 4.3.4 |

### Server Dependencies
| Package | Pinned Range | Resolved Version |
|---------|-------------|-----------------|
| express | ^4.21.2 | 4.22.1 |
| cors | ^2.8.6 | 2.8.6 |
| dotenv | ^16.4.5 | 16.6.1 |
| zod | ^3.24.2 | 3.25.76 |
| axios | ^1.14.0 | 1.14.0 |
| tsx | ^4.21.0 | 4.21.0 |
| typescript | ^5.5.0 | 5.9.3 |

## Confirmed Ports
- Client dev server: **5173** (Vite default)
- Express BFF server: **3001**
- Vite proxy: `/api/*` → `http://localhost:3001`

## Health Endpoint Confirmed
- URL: `http://localhost:3001/api/health`
- Response: `{"status":"ok","timestamp":"2026-04-07T12:25:39.153Z"}` (HTTP 200)
- Verified with curl during execution

## Env Validation Confirmed
- Server exits with `process.exit(1)` and clear error message when `WISPHUB_TOKEN` is empty/missing
- Test output: `[STARTUP ERROR] Missing required environment variables: { WISPHUB_TOKEN: [ 'WISPHUB_TOKEN is required' ] }`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Dependency] Added @types/node to client devDependencies**
- **Found during:** Task 1
- **Issue:** `vite.config.ts` uses `import path from 'path'` — requires `@types/node` for TypeScript to resolve the `path` module types. Without it, `tsc --noEmit` would fail.
- **Fix:** Added `"@types/node": "^20.17.0"` to `client/package.json` devDependencies
- **Files modified:** `client/package.json`
- **Commit:** ecf6fb6

### Known Version Differences

The Vite scaffold now generates a `tsconfig.app.json` split pattern (instead of a single `tsconfig.json`). The plan's tsconfig structure was adapted accordingly — `tsconfig.app.json` contains all compiler options including the `@/*` path alias, while `tsconfig.json` holds project references. This is equivalent in behavior to the plan's specification.

### Known Vulnerabilities (Deferred)

The esbuild version bundled with Vite 5.4.21 has a moderate severity vulnerability (GHSA-67mh-4wv8-2f99) affecting the development server only. The fix requires upgrading to Vite v8 which violates the locked version constraint (plan requires `^5.4.10`). This is deferred — the vulnerability only affects the local dev server, not production builds.

## Threat Model Coverage

All threats from the plan's threat register are mitigated:

| Threat ID | Status |
|-----------|--------|
| T-01-01 | Mitigated — `server/.env` in `.gitignore`, `.env.example` committed with placeholders |
| T-01-02 | Mitigated — 404 handler returns structured error, no stack traces |
| T-01-03 | Mitigated — CORS origin locked to `http://localhost:5173`, `credentials: false` |
| T-01-04 | Mitigated — Startup log shows `WISPHUB_BASE_URL` only, not token |
| T-01-05 | Mitigated — Zod `EnvSchema` validates at startup, `process.exit(1)` on failure |

## Self-Check: PASSED
