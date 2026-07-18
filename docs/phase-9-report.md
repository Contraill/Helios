# Phase 9 — Visual depth report

Date: 2026-07-18  
Base commit: `865309f47da707d450a6914ff9686884f9d1eb95`  
Gate: **PASS**

## Delivered

- Added a traceable surface manifest for the Sun and all eight planets, including source URL/ID, provider, attribution, usage note, representation type, colour space, material slot, local dimensions and deterministic decoded-byte estimates.
- Added low, medium and high WebP variants. The local encoded set, including Saturn's rings, is approximately 2 MB.
- Added shared reference-counted texture loading with race-safe late-load disposal and a colour fallback for failed requests.
- Added distinct surface material profiles and separate atmosphere shells. Mercury intentionally has no atmosphere. Low quality uses a cheap shell; medium/high use a Fresnel shader.
- Added Saturn's separate double-sided alpha rings at 1.24–2.27 planetary radii, within the axial-tilt group.
- Added an emissive textured Sun, corona shell and Explore-only bounded bloom. Bloom is confined to the explicit high-quality tier and is absent under reduced motion.
- Extended low/medium/high quality to control texture tier, geometry, atmosphere mode, ring segments, DPR, stars and bloom. High-quality overview keeps bodies at medium texture resolution and promotes the selected body to high.
- Added an explicit WebGL capability probe that preserves the semantic Explore interface and presents the visible DOM fallback before any R3F canvas is mounted.
- Kept Three.js behind the existing `/explore` client-only dynamic boundary; no home-page 3D import was added.
- Added a concise visible NASA visual-source note and kept enhanced-colour, composite and simulated representations explicit in the project manifest.

## Source verification

Official NASA pages were checked for the representation wording used in the manifest:

- Mercury: MESSENGER PIA17386 enhanced-colour map.
- Venus: Magellan radar imagery with filled gaps.
- Earth (A): USGS topographic-like map from the JPL/Caltech map database.
- Mars: Viking imagery processed at USGS.
- Jupiter: Voyager imagery.
- Saturn: explicitly fictional official catalogue texture.
- Uranus: procedural Helios simulation using Voyager 2 PIA01391 as the colour reference.
- Neptune: explicitly fictional Don Davis/JPL cloud texture.
- Sun: procedural Helios simulation using SDO PIA26681 as the visual reference.

No simulated texture is labelled as an observation.

## Verification performed

All commands used the project's required Node `22.22.0` and pnpm `10.34.4`.

- `pnpm format:check` — PASS.
- `pnpm lint` — PASS, no warnings.
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS, 42 files / 165 tests.
- `pnpm build` — PASS, all static and dynamic routes generated.
- `pnpm test:e2e` — PASS, 89 Chromium tests against a production build.
- Production browser visual check at 1440×1000 — one canvas, medium-tier Sun/eight-planet/Saturn-ring requests all HTTP 200, no `console.error`, no `pageerror`; Saturn ring geometry visibly clears the planet limb.

E2E acceptance includes:

- all eight selected high-resolution surface requests;
- all nine low-resolution body requests;
- low/medium/high quality and reduced-motion bloom behaviour;
- failed texture fallback;
- visible WebGL fallback with semantic controls retained;
- exploration/scientific scale, overview/focus/free camera and direct mouse/touch control;
- 390 px, 430 px, tablet and desktop layouts;
- hydration/console/page-error guards retained from C0.

## Known representation limits

- The global maps are explanatory equirectangular surfaces, not live observations or exact views from the current camera time.
- Sun, Uranus, Saturn and Neptune representation limits are explicitly recorded as simulation where applicable.
- Atmosphere thickness, glow and ring opacity are editorial visibility aids and are not physical volumetric models.
- This gate recorded deterministic texture dimensions and decoded-byte estimates; the subsequent measured browser/GPU audit and accepted budgets are recorded in `docs/phase-10-report.md`.

Phase 9 remains independently PASS. Phase 10 subsequently completed its separate audit without reopening this gate.
