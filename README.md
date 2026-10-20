# Helios

[![CI](https://github.com/Contraill/Helios/actions/workflows/ci.yml/badge.svg)](https://github.com/Contraill/Helios/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[Live demo](https://heliios.vercel.app)** · [Case study](https://heliios.vercel.app/case-study) · [Known limitations](docs/KNOWN_LIMITATIONS.md) · [Release evidence](docs/release-evidence/1.0.0/README.md)

Helios is an interactive Solar System explorer built around a simple question: what would another world feel like, not only how large is it?

The project combines a cinematic 3D experience with sourced planetary data, personal comparisons and explicit scale limits. It is developed as a portfolio project, but the product and scientific constraints are treated as production requirements.

![Helios home page](docs/screenshots/home.webp)

| Explore the system                                        | Follow a world through time                                                 |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| ![Helios Explore overview](docs/screenshots/explore.webp) | ![Earth in Explore with time controls](docs/screenshots/explore-earth.webp) |

## Current status

Version 1.0.0 ships detail pages for 57 real Solar System bodies and four regions, eight custom planet pages, a JPL Horizons-backed Explore timeline, two-world comparison, a sourced Missions index and NASA/JPL data surfaces with explicit fallback labels. Everything is available in English and Turkish (`/tr`).

Production deploys on Vercel only after the CI quality and cross-browser checks pass. What has and has not been checked on real hardware is listed in the [1.0.0 release evidence](docs/release-evidence/1.0.0/README.md); acceptance criteria live in `docs/TESTING_AND_RELEASE.md`.

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
- Vercel hosting, Web Analytics and Speed Insights

Optional scene packages are added only when a verified product requirement needs them. Helios does not use a UI component kit.

## Project structure

```text
src/
├── app/
│   ├── [locale]/              # every page, prerendered for en and tr
│   └── api/                   # ephemeris and health route handlers
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
├── styles/                    # design tokens
└── proxy.ts                   # locale URL rewrite, redirects and preference
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

`NASA_API_KEY` remains server-only. Local development can use verified snapshots and static fallbacks without it; current NeoWs responses and the release provider probe require the key; APOD and DONKI use keyless public endpoints. `NEXT_PUBLIC_NASA_API_KEY` is rejected by validation.

`SITE_URL` is optional locally and must contain only the canonical production origin when configured. Helios uses it for canonical and `hreflang` metadata, social URLs, `/sitemap.xml` and `/robots.txt`.

## Commands

| Command                        | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `pnpm dev`                     | Start the development server                                               |
| `pnpm build`                   | Create a production build                                                  |
| `pnpm lint`                    | Run ESLint                                                                 |
| `pnpm typecheck`               | Generate Next.js route types and run TypeScript                            |
| `pnpm test`                    | Run unit and component tests                                               |
| `pnpm test:e2e`                | Run Playwright tests                                                       |
| `pnpm test:e2e:release`        | Run the full Chromium suite, then every cross-browser release project      |
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

## Deployment

Helios runs on Vercel with the Node 22 runtime. Every push to `main` runs `.github/workflows/ci.yml`; the workflow reports `Vercel - helios: quality` and `Vercel - helios: e2e` statuses so production deployment waits for lint, typecheck, unit tests, build and the full browser matrix.

Production environment variables:

| Variable       | Required | Purpose                                                               |
| -------------- | -------- | --------------------------------------------------------------------- |
| `NASA_API_KEY` | Yes      | Server-only key for current NeoWs data                                |
| `SITE_URL`     | No       | Canonical origin; falls back to the Vercel production host when unset |

Vercel Analytics and Speed Insights load only when `VERCEL=1`, so local and test runs send no telemetry.

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

- `docs/ARCHITECTURE.md` — system diagram, route, scene, language and performance boundaries
- `docs/CELESTIAL_MODEL.md` — body/orbit model contracts
- `docs/ASSET_AND_SOURCES.md` — provenance and runtime asset policy
- `docs/TESTING_AND_RELEASE.md` — automated and manual release checks
- `docs/I18N.md` — complete EN/TR rendering and canonical URL policy
- `docs/API_ACCEPTANCE.md` — provider contracts, failure states and release probe
- `docs/PERFORMANCE.md` — static budgets and native runtime measurement contract
- `docs/KNOWN_LIMITATIONS.md` — scientific, data and device-dependent limits and deferred scope
- `docs/release-evidence/1.0.0/` — recorded performance, provider and device evidence for 1.0.0

Only the active documents above define the current product and release requirements.

## License

Source code is released under the [MIT License](LICENSE). Planet and body textures keep their original provider licences and attributions, recorded in `docs/ASSET_AND_SOURCES.md` and `scripts/data/texture-runtime-manifest.json`.
