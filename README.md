# Helios

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

## Current status

Helios includes semantic detail routes for 57 real Solar System bodies and four regional context layers, eight custom planet pages, normalized NASA/JPL data surfaces with explicit fallback metadata, a two-world comparison experience, a sourced Missions index and a JPL Horizons-backed Explore timeline.

The `/body/[slug]` library covers the Sun, eight planets, 22 featured planetary moons, 18 extended bodies and eight dwarf-system satellites. `/region/[slug]` adds the asteroid belt, Kuiper belt, Oort cloud and heliosphere. Existing `/planet/[slug]` and `/object/[slug]` routes remain compatible and point search engines to canonical body pages.

Explore starts at the current UTC time, supports accelerated playback across a bounded historical and future range, and keeps camera, selection and simulation state under a single scene authority. Galactic Context is a separate schematic Milky Way map with a labelled Solar System marker; it is not presented as one physically continuous zoom. Solar prominences use deterministic emergence/decay and reduced-motion-aware plasma flow.

English and Turkish cover the complete product surface: the global shell, Explore, Compare, Missions, Data, About, Case Study, all semantic body/region pages, eight custom planet compositions, metadata and remote-data states. The language cookie preserves the current route and scene state while Server Components refresh in the selected locale.

The current release candidate is complete at source level. It remains local until the native verification, production build, provider probe and browser/device acceptance described in `docs/ROADMAP.md` are complete.

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

Optional scene packages are added only when a verified product requirement needs them. Helios does not use a UI component kit.

## Project structure

```text
src/
├── app/                       # routes and server-rendered page entrypoints
├── components/                # layout and reusable UI
├── content/
│   ├── planets/               # eight validated planet records
│   └── sources/               # NASA/JPL source registry
├── features/
│   ├── body-details/          # shared Sun, moon and small-body detail routes
│   ├── comparison/            # shareable two-world comparison
│   ├── data-presentation/     # source, metric and methodology primitives
│   ├── editorial-pages/       # About and case-study presentation system
│   ├── home/                  # localized home composition
│   ├── missions/              # sourced editorial mission catalogue
│   ├── planet-details/        # eight custom planet compositions
│   ├── solar-system/          # scene, ephemeris, interaction and camera orchestration
│   └── space-data/            # normalized NASA/JPL data surfaces
├── hooks/                     # client capability and preference hooks
├── lib/
│   ├── calculations/          # pure domain calculations
│   ├── data/                  # schemas, ephemeris and external providers
│   ├── env/                   # server-only environment validation
│   ├── i18n/                  # locale primitives and translated copy
│   └── metadata/              # canonical site URL helpers
├── stores/                    # bounded client interaction preferences/state
└── styles/                    # design tokens
```

## Local development

Requirements: Node 22 and the pnpm version pinned in `package.json`. The repository, GitHub Actions and Vercel deployment contract all target the Node 22 major line.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm verify
pnpm dev
```

`NASA_API_KEY` remains server-only. Local development can use verified snapshots and static fallbacks without it; current APOD, DONKI and NeoWs responses and the release provider probe require the key. `NEXT_PUBLIC_NASA_API_KEY` is rejected by validation.

`SITE_URL` is optional locally and must contain only the canonical production origin when configured. Helios uses it for canonical metadata, social URLs, `/sitemap.xml` and `/robots.txt`.

## Commands

| Command                        | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `pnpm dev`                     | Start the development server                                               |
| `pnpm build`                   | Create a production build                                                  |
| `pnpm lint`                    | Run ESLint                                                                 |
| `pnpm typecheck`               | Generate Next.js route types and run TypeScript                            |
| `pnpm test`                    | Run unit and component tests                                               |
| `pnpm test:e2e`                | Run Playwright tests                                                       |
| `pnpm format:check`            | Check formatting                                                           |
| `pnpm audit:routes`            | Validate canonical metadata, sitemap and legacy routes                     |
| `pnpm audit:scene`             | Validate Galactic Context and solar prominence contracts                   |
| `pnpm audit:boundaries`        | Guard home and Missions from WebGL dependency leakage                      |
| `pnpm audit:editorial`         | Server-render and inspect both locales across editorial routes             |
| `pnpm audit:interactions`      | Validate focus, live-region and form feedback contracts without a browser  |
| `pnpm audit:i18n`              | Validate paired language catalogues and server locale routes               |
| `pnpm audit:providers`         | Validate provider auth, version, cache and fallback contracts              |
| `pnpm audit:sources`           | Validate source registry and official HTTPS provenance                     |
| `pnpm audit:budgets`           | Enforce static scene, texture, route and provider budgets                  |
| `pnpm probe:providers:release` | Probe official services with the production key                            |
| `pnpm verify`                  | Run the full source, route, scene, language, data, unit and texture checks |
| `pnpm audit:performance`       | Measure the production High visual contract                                |

## Rendering and interaction policy

- Planetary physical parameters and approximate orbital elements come from NASA/JPL.
- Explore uses sourced Horizons vectors for selected dates; accelerated playback and active scrubbing are explicitly labelled approximate previews.
- Exploration mode uses separate presentation transforms for legibility; scientific mode uses one shared linear ratio for radii and distance.
- Camera state is centralized; body components publish selection events and never move the camera directly.
- Frame loops mutate Three.js objects without writing React state every frame.
- Helios ships one High visual contract. Runtime capability handling, staged loading and reduced-motion behavior are automatic.
- Galactic Context is a separately labelled schematic representation, not a navigation-grade extension of Solar System scale.
- Dynamic NASA/JPL data is normalized and validated on the server before it reaches the UI; source time, retrieval time and fallback status remain distinct.

## Repository documentation

- `docs/ROADMAP.md` — active milestones and remaining acceptance
- `docs/ARCHITECTURE.md` — route, scene, language and performance boundaries
- `docs/ARCHITECTURE_DIAGRAM.md` — system ownership and data-flow diagram
- `docs/CELESTIAL_MODEL.md` — body/orbit model contracts
- `docs/ASSET_AND_SOURCES.md` — provenance and runtime asset policy
- `docs/TESTING_AND_RELEASE.md` — automated and manual release checks
- `docs/I18N.md` — complete EN/TR rendering and canonical URL policy
- `docs/API_ACCEPTANCE.md` — provider contracts, failure states and release probe
- `docs/PERFORMANCE.md` — static budgets and native runtime measurement contract
- `docs/KNOWN_LIMITATIONS.md` — scientific, data and device-dependent limits
- `docs/RELEASE_CHECKLIST.md` — native, browser/GPU and deployment closure

Only the active documents above define the current product and release requirements.
