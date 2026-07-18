# Phase 10 — Performance and accessibility report

Date: 2026-07-18  
Base commit: `865309f47da707d450a6914ff9686884f9d1eb95`  
Gate: **PASS**

## Performance result

The final production measurement used Node 22.22.0 and Chromium 149 headless
shell with SwiftShader at 1440×1000, selected Saturn and four-second samples.
SwiftShader is recorded as a conservative regression environment; it is not a
hardware-accelerated device benchmark.

| Measurement                        |  Baseline |              Final |      Budget |
| ---------------------------------- | --------: | -----------------: | ----------: |
| Initial Home script transfer       |       n/a |          242,539 B |   ≤ 260 KiB |
| Root shared JS, gzip               | 172,080 B |          172,080 B |   ≤ 180 KiB |
| Explore 3D dynamic JS, gzip        | 251,368 B |          249,590 B |   ≤ 260 KiB |
| Cold Explore script transfer       |       n/a |          502,033 B |   ≤ 525 KiB |
| Low average FPS                    |     28.76 |              28.03 |        ≥ 25 |
| Medium average FPS                 |      6.84 |              22.50 |        ≥ 18 |
| High average FPS                   |      6.69 |              14.82 |        ≥ 10 |
| Low / medium / high JS heap        |       n/a | 9.66/9.72/9.84 MiB |    ≤ 12 MiB |
| Long tasks in each four-second run |       n/a |          0 / 0 / 0 | 0 preferred |

Medium improved by approximately 3.29× and high by 2.21× relative to the
post-Phase-9 bloom baseline. Low variation is within the software-renderer run
variance.

The final texture transfers were 43,290 B low, 181,814 B medium and 284,892 B
focused high. Home loaded zero scene textures. Deterministic active mip-chain
upper bounds are approximately 1.58 MiB low, 6.33 MiB medium and 19 MiB for the
worst high-resolution focus transition. All remain inside the accepted budget.

The instrumented scene audit recorded:

| Tier   | Draws | Geometry | Materials | Objects | Shaders | Triangles |
| ------ | ----: | -------: | --------: | ------: | ------: | --------: |
| Low    |    19 |       37 |        37 |      57 |      12 |     3,326 |
| Medium |    19 |       37 |        37 |      57 |      12 |     6,986 |
| High   |    20 |       38 |        37 |      57 |      12 |    14,863 |

The temporary scene probe used to capture these counts was removed before the
final build. No debug monitor, FPS panel or diagnostic global ships to the
client.

## Runtime changes and findings

- Replaced multi-pass Unreal bloom with one bounded high-tier-only shader pass.
  Low and medium use no post-processing; reduced motion disables it in every
  tier.
- Capped DPR at 1, 1.25 and 1.5 for low, medium and high.
- Compiled invariant osculating-orbit/window data when source inputs change and
  reused one mutable scene-position tuple per planet. The frame loop no longer
  searches the bundle, rebuilds orbital elements or creates transient position
  objects per planet per frame.
- Confirmed frame loops mutate Three.js refs only; they do not write React or
  Zustand state.
- Texture loading is shared, reference-counted, race-safe and retryable after a
  failure. A five-second delayed disposal prevents focus churn while still
  releasing GPU resources after route teardown.
- Hidden documents and reduced-motion sessions render on demand.
- Initial Home loaded 242,539 B of scripts, no Explore 3D dynamic chunk and no
  texture. A cold Explore load made exactly one `/api/ephemeris` request, ten
  unique default-quality texture requests and no duplicates.
- Leaving Explore removed the canvas; after the texture grace period the shared
  cache released its entries. Repeated push navigation retains Next App Router
  history entries, as it also does for a non-3D Compare route, so DOM/listener
  counters can reflect browser history cache rather than live canvases. Explicit
  back/forward reuse was tested and never produced more than one live canvas.

## Accessibility result

- Axe WCAG A/AA scans reported zero automated violations on Home, Explore,
  Earth, Compare and Data.
- Keyboard planet selection, visible focus, Escape and trigger focus restoration
  passed production E2E.
- The eight planets remain real DOM buttons outside Canvas; selected summaries
  are semantic regions.
- System reduced motion produces a static named scene, demand rendering and no
  bloom while preserving direct pointer/touch camera input when motion is
  allowed.
- WebGL capability failure preserves simulation controls and the semantic planet
  navigator with an understandable status message.
- Explore, Earth and Data produced no horizontal document overflow at the
  720-CSS-pixel equivalent of 200% zoom.
- Existing 390×844, 430 px, 768×1024, mouse, touch and minimum-target acceptance
  tests remain in the production suite.

Automated contrast/semantics checks complement, but do not replace, manual
screen-reader and hardware-device review.

## Verification and security

Final gate results from the commands actually run under Node 22.22.0:

- `pnpm format:check` — PASS.
- `pnpm lint` — PASS, no warnings.
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS, 42 files / 167 tests.
- `pnpm build` — PASS, all production routes generated.
- `pnpm test:e2e` — PASS, 103/103 Chromium tests against a production build.

The suite includes unit/component, production build, production Playwright,
hydration/console, API fallback, texture failure, keyboard, reduced motion,
quality, scale and camera coverage. The final browser run also caught and closed
a 1280×720 collision between the expanded ephemeris and simulation panels; at
short desktop heights those interfaces now enter a bounded two-column flow
below the scene.

The final production client contains no `NASA_API_KEY`,
`NEXT_PUBLIC_NASA_API_KEY`, diagnostic global, debug panel or console logger.
Chromium production coverage was available in this environment. Firefox and
WebKit binaries were not installed, so no result is claimed for them.

## Remaining real limits

- Surface maps, corona, atmosphere thickness and ring opacity remain editorial
  representations with the exact limits recorded in the texture manifest.
- SwiftShader numbers are useful regression floors, not predictions for every
  phone or GPU. Physical-device profiling remains appropriate before a broad
  release.
- Next App Router intentionally retains navigated route trees in browser history;
  the relevant safety property here is teardown of live WebGL resources and
  bounded reuse, not a requirement that history consume zero memory.
- External feeds may truthfully show fallback, stale, partial or historical
  status when a provider/key is unavailable. The audit does not relabel fallback
  data as current.

Phase 10 is PASS. C0, Phase 9 and Phase 10 are independently PASS, so Block C is
complete. Phase 11 has not started.
