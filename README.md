# Helios

An interactive Solar System explorer that turns scientific data into a
cinematic, personal experience — "what would my weight feel like on Mars?",
not just "what is Mars' diameter?".

> **Status: Phase 1 — project foundation.** This repository currently contains
> the verified scaffold only: route skeletons, design tokens, environment
> validation, tests and CI. The 3D scene, planet content, comparisons and NASA
> integrations land in later phases. Nothing here pretends to work before it
> does.

## Principles (short version)

- **Scientific honesty.** No value ships without a source; nothing that is not
  real-time is ever labelled "live"; a single rover measurement is never
  presented as "weather on Mars".
- **Scale honesty.** The exploration view is deliberately not to scale and
  says so; a separate scientific-scale mode explains why real proportions are
  unusable on screen.
- **Accessibility and performance are architecture,** not polish: semantic
  fallbacks next to the canvas, keyboard support, reduced motion, quality
  levels, and a home page that never loads the 3D bundle.

The full working documents (product requirements, design system, architecture,
data & science policy, roadmap, quality standard) live in the project source
pack (Turkish) and are mirrored into decisions here as they are made.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 on
top of a custom CSS custom-property token system (`src/styles/tokens.css`) ·
Zod · Vitest + React Testing Library · Playwright · pnpm · GitHub Actions.

Deliberately **not** installed yet (later phases): Three.js / React Three
Fiber / drei, Zustand, Motion, post-processing, any NASA client code, any UI
component kit (never).

## Getting started

Requirements: Node ≥ 20.9 (see `.nvmrc`), pnpm 11 (`corepack enable pnpm`).

```bash
pnpm install
cp .env.example .env.local   # optional in Phase 1 — no keys required yet
pnpm dev
```

## Scripts

| Script                              | What it does                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                          | Development server                                      |
| `pnpm build` / `pnpm start`         | Production build / serve                                |
| `pnpm lint`                         | ESLint (official Next.js flat config + Prettier compat) |
| `pnpm typecheck`                    | `next typegen` + `tsc --noEmit`                         |
| `pnpm test` / `pnpm test:watch`     | Vitest unit & component tests                           |
| `pnpm test:e2e`                     | Playwright smoke tests against a production build       |
| `pnpm format` / `pnpm format:check` | Prettier                                                |
| `pnpm verify`                       | lint + typecheck + test + build                         |

## Environment

| Variable       | Required          | Notes                                                                                                                                                                                      |
| -------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NASA_API_KEY` | Not until Phase 7 | Server-only by architecture: it is read via `src/lib/env` (guarded by the `server-only` package), and the schema rejects any `NEXT_PUBLIC_NASA_API_KEY`. Error messages never echo values. |

## Structure

```
src/
├── app/            # routes: /, /explore, /planet/[slug], /compare, /data,
│                   # /about, /case-study, /api/health (+ error / not-found)
├── components/     # layout (header, footer, skip link) + ui primitives
├── lib/
│   ├── env/        # schema (pure, tested) + server-only accessor
│   └── i18n/       # ui-strings.ts — single source of UI copy (EN default)
└── styles/         # tokens.css — design token source of truth
```

`/planet/[slug]` currently validates against a temporary slug allowlist and
renders an explicit placeholder — the sourced planet domain model arrives in
Phase 2. There is intentionally no `/missions` route yet (missions will live
on planet pages first).

## Documentation

- `docs/decisions.md` — canonical decision log (Turkish)
- `docs/risk-register.md` — risk register (Turkish)
