# Helios

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

## Current status

Helios includes eight editorial planet pages, normalized NASA/JPL data surfaces with explicit fallback metadata, a two-world comparison experience and a JPL Horizons-backed Explore timeline.

Explore starts at the current UTC time, supports accelerated playback across a bounded historical and future range, and keeps camera, selection and simulation state under a single scene authority. Planetary surfaces, atmospheres, rings, city lights, featured moons, dwarf worlds, asteroids and comets share one asset and provenance system.

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

Optional scene packages are added only when an accepted gate has a concrete need for them. Helios does not use a UI component kit.

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

| Command             | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | Start the development server                              |
| `pnpm build`        | Create a production build                                 |
| `pnpm lint`         | Run ESLint                                                |
| `pnpm typecheck`    | Generate Next.js route types and run TypeScript           |
| `pnpm test`         | Run unit and component tests                              |
| `pnpm test:e2e`     | Run Playwright smoke tests against a production build     |
| `pnpm format:check` | Check formatting                                          |
| `pnpm verify`       | Run format, lint, typecheck, unit tests and texture audit |

## Rendering and interaction policy

- Planetary physical parameters and approximate orbital elements come from NASA/JPL.
- Explore uses sourced Horizons vectors for selected dates; accelerated playback and active scrubbing are explicitly labelled approximate previews.
- Exploration mode uses separate presentation transforms for legibility; scientific mode uses one shared linear ratio for radii and distance.
- Camera state is centralized; planet components publish selection events and never move the camera directly.
- Frame loops mutate Three.js objects without writing React state every frame.
- Helios ships one High visual contract. Runtime capability handling, staged loading and reduced-motion behavior are automatic; there is no user-facing or persisted quality tier.
- Dynamic NASA/JPL data is normalized and validated on the server before it reaches the UI; source time, retrieval time and fallback status remain distinct.

## Repository documentation

Current product and engineering contracts live in `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/CELESTIAL_MODEL.md`, `docs/ASSET_AND_SOURCES.md` and `docs/TESTING_AND_RELEASE.md`. Historical generated delivery reports are not requirements.
