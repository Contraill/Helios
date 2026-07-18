# Helios

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

## Current status

Phases 6–8, Block B.5 / Phase 8.5 and Block C are implemented. Helios now includes eight distinct server-rendered planet references, normalized NASA/JPL data surfaces with explicit fallback metadata, the two-world comparison experience, and a sourced JPL Horizons Explore timeline.

Explore opens at the current UTC time in unpaused Real time mode, supports six playback speeds, a dynamic −500/+600 calendar-year range, cached Horizons windows with Hermite interpolation, long-range body-center/barycenter resolution, and one mouse/touch/keyboard-capable camera authority. The Phase 8.5 commit has been deployed; a post-deploy hydration mismatch discovered on `/explore` is covered by the current production-mode acceptance repair.

The local Block C acceptance package adds traceable multi-resolution planetary surfaces, distinct atmospheres, Saturn's rings, a controlled and selectable Sun/corona treatment, quality-aware loading, production performance budgets and a WCAG-oriented final audit. The Sun and all eight planets share pointer, touch, keyboard, camera-focus and focus-restoration behaviour. It is prepared for user test and push; the live deployment remains unchanged until that push. Phase 11 has not started.

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
│   ├── data-presentation/     # source, metric and methodology primitives
│   ├── planet-details/        # editorial detail-page compositions
│   ├── solar-system/          # scene, ephemeris, interaction and camera orchestration
│   └── space-data/            # normalized NASA/JPL data surfaces
├── hooks/                     # client capability and preference hooks
├── lib/
│   ├── calculations/          # pure domain calculations
│   ├── data/                  # schemas, ephemeris and external providers
│   ├── env/                   # server-only environment validation
│   └── i18n/                  # shared UI copy
├── stores/                    # bounded client interaction state
└── styles/                    # design tokens
```

## Local development

Requirements: Node 22 and the pnpm version pinned in `package.json`. The
repository, GitHub Actions and Vercel deployment contract all target the Node
22 major line.

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
- Explore uses sourced Horizons vectors for selected dates; accelerated playback and active scrubbing are explicitly labelled approximate previews.
- Exploration mode uses separate presentation transforms for legibility; scientific mode uses one shared linear ratio for radii and distance.
- Camera state is centralized; planet components publish selection events and never move the camera directly.
- Frame loops mutate Three.js objects without writing React state every frame.
- Quality levels control DPR, star density, geometry, orbit sampling, texture resolution, atmosphere cost, Saturn ring detail and high-tier-only bounded bloom.
- Dynamic NASA/JPL data is normalized and validated on the server before it reaches the UI; source time, retrieval time and fallback status remain distinct.

## Documentation

- [`docs/project/00_START_HERE.md`](docs/project/00_START_HERE.md) — working protocol and document order
- [`docs/project/05_DEVELOPMENT_ROADMAP.md`](docs/project/05_DEVELOPMENT_ROADMAP.md) — phase plan and acceptance criteria
- [`docs/project/06_TESTING_QUALITY_RELEASE.md`](docs/project/06_TESTING_QUALITY_RELEASE.md) — quality and release standard
- [`docs/decisions.md`](docs/decisions.md) — decision log
- [`docs/phase-8-5-report.md`](docs/phase-8-5-report.md) — ephemeris, simulation-clock and live acceptance gate
- [`docs/phase-9-report.md`](docs/phase-9-report.md) — visual depth, asset and attribution gate
- [`docs/phase-10-report.md`](docs/phase-10-report.md) — measured performance and accessibility gate
- [`docs/celestial-catalog-expansion-plan.md`](docs/celestial-catalog-expansion-plan.md) — clickable moons, dwarf planets, candidates, exoplanets and Kuiper Belt delivery contract
- [`docs/block-b-opening-report.md`](docs/block-b-opening-report.md) — historical Block B opening slice
