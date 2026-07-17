# Helios

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

## Current status

Phase 3 is complete. The `/explore` route now contains a lightweight, data-driven 3D overview with:

- the Sun and all eight planets,
- exploration-scale radii and orbital distances,
- elliptical orbit paths, orbital inclination and axial tilt,
- frame-rate independent orbital and axial motion, including retrograde rotation,
- a deterministic point-based star field,
- responsive overview framing, loading and WebGL fallback states,
- reduced-motion support and a semantic planet list outside the canvas.

Planet selection and camera focus are intentionally reserved for Phase 4.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Three.js and React Three Fiber
- Tailwind CSS v4 with project-owned design tokens
- Zod
- Vitest and React Testing Library
- Playwright
- pnpm
- GitHub Actions

Drei, Zustand, Motion and post-processing are added only when a phase has a concrete need for them. Helios does not use a UI component kit.

## Project structure

```text
src/
├── app/                       # routes and server-rendered pages
├── components/                # layout and reusable UI
├── content/
│   ├── planets/               # eight validated planet records
│   └── sources/               # NASA/JPL source registry
├── features/
│   └── solar-system/          # scene components and deterministic motion
├── hooks/                     # client capability and preference hooks
├── lib/
│   ├── calculations/          # pure domain calculations
│   ├── data/schemas/          # Zod contracts
│   ├── env/                   # server-only environment validation
│   └── i18n/                  # shared UI copy
└── styles/                    # design tokens
```

## Local development

Requirements: Node 22 and the pnpm version pinned in `package.json`.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm verify
pnpm dev
```

`NASA_API_KEY` is optional until the first NASA API integration. It remains server-only; `NEXT_PUBLIC_NASA_API_KEY` is rejected by validation.

## Commands

| Command             | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `pnpm dev`          | Start the development server                          |
| `pnpm build`        | Create a production build                             |
| `pnpm lint`         | Run ESLint                                            |
| `pnpm typecheck`    | Generate Next.js route types and run TypeScript       |
| `pnpm test`         | Run unit and component tests                          |
| `pnpm test:e2e`     | Run Playwright smoke tests against a production build |
| `pnpm format:check` | Check formatting                                      |
| `pnpm verify`       | Run format, lint, typecheck, unit tests and build     |

## Rendering and data policy

- Planetary physical parameters and approximate orbital elements come from NASA/JPL.
- Approximate elements drive explanatory motion; the scene is not presented as precise ephemeris output.
- Planet radii and distances use separate exploration-scale transforms so the whole system remains legible.
- Texture-heavy rendering, atmosphere shaders, rings and bloom remain outside the Phase 3 baseline.
- Dynamic NASA data will be normalized and validated on the server before it reaches the UI.

## Documentation

- [`docs/project/00_START_HERE.md`](docs/project/00_START_HERE.md) — working protocol and document order
- [`docs/project/05_DEVELOPMENT_ROADMAP.md`](docs/project/05_DEVELOPMENT_ROADMAP.md) — phase plan and acceptance criteria
- [`docs/project/06_TESTING_QUALITY_RELEASE.md`](docs/project/06_TESTING_QUALITY_RELEASE.md) — quality and release standard
- [`docs/decisions.md`](docs/decisions.md) — decision log
- [`docs/phase-3-report.md`](docs/phase-3-report.md) — latest completed phase report
