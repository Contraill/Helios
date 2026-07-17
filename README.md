# Helios

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

## Current status

Phase 4 implementation is complete and the non-browser acceptance gates pass. The `/explore` route now supports a complete first interaction loop:

- hover, click and touch selection on the rendered planets,
- a semantic keyboard-accessible navigator outside the canvas,
- a central camera rig with overview, transition and focus states,
- frame-rate independent camera movement that follows orbiting planets,
- immediate replacement of an in-flight transition when another planet is selected,
- Escape and explicit overview controls with focus restoration,
- visible in-scene labels, selection emphasis and a sourced summary panel,
- reduced-motion behavior that snaps rather than animates the camera.

Simulation controls, scale switching, quality levels and preference persistence remain Phase 5 work.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Three.js and React Three Fiber
- Zustand for bounded client interaction state
- Tailwind CSS v4 with project-owned design tokens
- Zod
- Vitest and React Testing Library
- Playwright
- pnpm
- GitHub Actions

Drei, Motion and post-processing are added only when a phase has a concrete need for them. Helios does not use a UI component kit.

## Project structure

```text
src/
├── app/                       # routes and server-rendered pages
├── components/                # layout and reusable UI
├── content/
│   ├── planets/               # eight validated planet records
│   └── sources/               # NASA/JPL source registry
├── features/
│   └── solar-system/          # scene, interaction and camera orchestration
├── hooks/                     # client capability and preference hooks
├── lib/
│   ├── calculations/          # pure domain calculations
│   ├── data/schemas/          # Zod contracts
│   ├── env/                   # server-only environment validation
│   └── i18n/                  # shared UI copy
├── stores/                    # bounded client interaction state
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

## Rendering and interaction policy

- Planetary physical parameters and approximate orbital elements come from NASA/JPL.
- Approximate elements drive explanatory motion; the scene is not presented as precise ephemeris output.
- Planet radii and distances use separate exploration-scale transforms so the whole system remains legible.
- Camera state is centralized; planet components publish selection events and never move the camera directly.
- Frame loops mutate Three.js objects without writing React state every frame.
- Texture-heavy rendering, atmosphere shaders, rings and bloom remain outside the current baseline.
- Dynamic NASA data will be normalized and validated on the server before it reaches the UI.

## Documentation

- [`docs/project/00_START_HERE.md`](docs/project/00_START_HERE.md) — working protocol and document order
- [`docs/project/05_DEVELOPMENT_ROADMAP.md`](docs/project/05_DEVELOPMENT_ROADMAP.md) — phase plan and acceptance criteria
- [`docs/project/06_TESTING_QUALITY_RELEASE.md`](docs/project/06_TESTING_QUALITY_RELEASE.md) — quality and release standard
- [`docs/decisions.md`](docs/decisions.md) — decision log
- [`docs/phase-4-report.md`](docs/phase-4-report.md) — latest completed phase report
