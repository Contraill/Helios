# Phase 9 — Visual depth report

Date: 2026-07-18  
Base commit: `865309f47da707d450a6914ff9686884f9d1eb95`  
Gate: **PASS after visual-acceptance repair**

## Delivered

- Added a traceable surface manifest for the Sun and all eight planets with
  source URL/ID, provider, attribution, licence, representation type, colour
  space, dimensions and deterministic decoded-byte estimates.
- Added low, medium and focused-high WebP variants. The complete encoded asset
  set, including Earth clouds and Saturn's rings, is approximately 5 MiB.
- Focused High uses 4096×2048 surfaces where the source supports them and a
  2048×1024 minimum for the Sun, Uranus and Neptune. High Earth clouds are
  2048×1024 and the radial Saturn ring profile is 4096×250.
- Added a reference-counted texture cache that keeps the last successful lease
  visible until a requested quality/body variant resolves. Changing planet or
  quality therefore no longer flashes an untextured fallback.
- Added 16× anisotropic filtering, mipmaps and correct equirectangular wrapping.
- Added distinct neutral-light material profiles, separate atmosphere shells,
  a transparent Earth cloud shell, radial Saturn rings, an emissive Sun and a
  restrained corona/bloom treatment.
- Removed body-coloured emissive lighting and changed the Sun point light to a
  neutral warm-white source. This closes the intermittent red-light cast.
- Replaced the selected-planet wireframe cage with a clean backside halo.
- Labels render at 2×/3× logical resolution with screen-space sizing so camera
  approach does not enlarge and blur them.
- Guided focus selects an illuminated viewing hemisphere and keeps a stable
  camera offset during accelerated time. The smaller focus floor makes Mercury
  surface detail legible without clipping the body.
- High-quality overview keeps unselected bodies at medium resolution and
  promotes only the selected body. The Sun now follows the same rule rather than
  loading its high asset at initial overview.
- The Sun is a first-class clickable body: pointer/touch Canvas hit target, DOM
  button, camera focus, crisp label, semantic summary and Escape focus return.

## Source and representation policy

The distributable high-detail assets use attributed CC BY 4.0 Solar System
Scope source maps based on NASA elevation/imagery material where available.
Helios resizes and converts them to WebP and records their representation limits
in the manifest. Uranus and Neptune retain explicitly simulated NASA-reference
profiles. Enhanced-colour, radar/composite and simulated surfaces are never
presented as current observations.

The visible Explore attribution links to the visual texture source/licence. The
scientific data registry and visual asset registry remain separate.

## Visual acceptance evidence

A 1440×1000 production Chromium/SwiftShader sweep selected the Sun and all eight
planets at High quality. Every focused high texture returned HTTP 200. The sweep
recorded zero console errors, page errors and failed requests.

Manual inspection of those nine captures confirmed:

- Mercury/Venus/Mars textures remain detailed without coloured-light wash;
- Earth clouds remain a separate readable layer;
- Jupiter bands and the giant-planet terminators retain surface detail;
- Saturn's 4096-pixel radial ring bands remain visible at the guided angle;
- Uranus and Neptune remain visually distinct;
- labels remain sharp while zoomed and the selection halo does not cover maps.

## Verification

- `pnpm format:check` — PASS.
- `pnpm lint` — PASS, no warnings.
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS, 42 files / 172 tests.
- `pnpm build` — PASS, all routes generated.
- Playwright production suite — PASS, 104/104 Chromium tests.
- Temporary capture/probe test removed before packaging.

## Known representation limits

- Surface maps are explanatory global maps, not live observations or exact
  camera-time views.
- Atmosphere thickness, glow, cloud altitude and ring opacity are editorial
  visibility aids rather than volumetric physical models.
- High quality is intentionally the visual-first tier; Low and Medium retain
  smaller assets and lower render cost.

Phase 9 is independently PASS. The measured runtime gate is recorded in
`docs/phase-10-report.md`.
