# Phase 10 — Performance and accessibility report

Date: 2026-07-18  
Base commit: `865309f47da707d450a6914ff9686884f9d1eb95`  
Gate: **PASS after high-fidelity remeasurement**

## Production measurement

The final measurement used Node 22.22.0 and Chromium 149 headless shell with
SwiftShader at 1440×1000, selected Saturn and four-second samples. SwiftShader
is a conservative software-renderer regression environment, not a prediction
for a hardware-accelerated phone or desktop GPU.

The visual-acceptance repair deliberately raised the High tier to 1.75 DPR,
64×48 focused-body geometry, 56×40 atmosphere geometry and 2K–4K focus maps.
The accepted software-renderer floors were therefore recorded again instead of
reusing the earlier lower-fidelity numbers.

| Measurement                        |              Final | Accepted budget |
| ---------------------------------- | -----------------: | --------------: |
| Initial Home script transfer       |          243,705 B |       ≤ 260 KiB |
| Root shared JS, gzip               |          172,080 B |       ≤ 180 KiB |
| Explore 3D dynamic JS, gzip        |          250,369 B |       ≤ 260 KiB |
| Cold Explore script transfer       |          504,119 B |       ≤ 525 KiB |
| Low average FPS                    |              19.67 |            ≥ 18 |
| Medium average FPS                 |              14.06 |            ≥ 12 |
| High average FPS                   |              10.17 |             ≥ 9 |
| Low / medium / high JS heap        | 9.71/9.85/9.85 MiB |        ≤ 12 MiB |
| Long tasks in each four-second run |              0/0/0 |     0 preferred |

The final texture transfers were 36,320 B Low, 204,912 B Medium and 281,060 B
for the selected-Saturn High transition. No tier issued a duplicate texture
request and each issued one `/api/ephemeris` request. Home loaded no texture and
did not load the Explore 3D dynamic chunk.

## Runtime changes and findings

- High remains the explicitly visual-first tier. Low/Medium use smaller maps,
  lower DPR, geometry, ring detail, stars and no bloom.
- High overview uses medium maps and promotes one selected body, preventing all
  2K–4K surfaces from decoding simultaneously.
- The Sun was corrected to use that same focus promotion rule.
- Shared texture leases keep the previous successful surface during an async
  quality/body switch and release GPU resources after the grace period.
- Earth clouds are a separate layer in Medium/High and are omitted in Low.
- Invariant ephemeris/orbit evaluators are compiled outside the frame loop;
  frame updates mutate Three.js refs without React/Zustand frame writes.
- Hidden documents and reduced-motion sessions use demand rendering. Bloom is
  High-only and disabled under reduced motion.
- The final browser sweep reported zero console errors, page errors, failed
  requests or long tasks.

## Accessibility and interaction

- Axe WCAG A/AA scans returned zero automated violations on Home, Explore,
  Earth, Compare and Data.
- The Sun and all eight planets are real DOM buttons outside Canvas and direct
  pointer/touch targets inside Canvas.
- Sun/planet selection, semantic summary, guided focus, Escape and trigger-focus
  restoration are covered in production E2E.
- One OrbitControls authority supports mouse drag, touch orbit, wheel/pinch,
  keyboard pan and guided/free-camera return without competing camera writers.
- WebGL failure preserves simulation controls and the semantic celestial-body
  navigator.
- 390×844, 430×932, 768×1024 and 200%-layout-equivalent checks retain access to
  controls without horizontal document overflow.
- Reduced motion preserves selection and direct control while stopping
  continuous decorative motion and bloom.

Automated checks complement rather than replace a final physical-device and
manual screen-reader pass.

## Verification and security

- `pnpm verify` — PASS: format, lint, typecheck, 42 files / 172 tests and build.
- Playwright production suite — PASS, 104/104 Chromium tests.
- High-quality nine-body visual sweep — PASS with zero browser/network errors.
- No temporary visual probe ships in the repository.
- No `NASA_API_KEY`, `NEXT_PUBLIC_NASA_API_KEY`, diagnostic global, debug panel
  or production console logger is present.

Firefox/WebKit binaries and physical GPU devices were unavailable in this
environment, so no result is claimed for them.

## Remaining real limits

- SwiftShader results are regression floors. Hardware profiling remains the
  release follow-up for High at large DPR displays.
- Visual surfaces and atmospheric effects retain the representation limits in
  the texture manifest.
- External providers may truthfully report current, historical, fallback,
  partial or stale state; no fallback response is relabelled as current.

Phase 10 is PASS. C0, Phase 9 and Phase 10 are independently complete; Phase 11
has not started.
