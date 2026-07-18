# Phase 10 — Performance and accessibility audit plan

Date: 2026-07-18  
Prerequisite: Phase 9 PASS

## Measurement method

Budgets were set only after measuring the Phase 9 production build. The
reproducible runtime harness is `scripts/measure-phase-10.mjs`; it runs the
production server, opens a 1440×1000 Chromium session, selects Saturn and
samples each quality tier for four seconds. The recorded browser is Chromium
149 headless shell with SwiftShader on Node 22.22.0. SwiftShader results are a
conservative regression reference, not a claim about hardware-accelerated user
FPS.

Bundle size is reported as raw, gzip and Brotli bytes. Browser transfer sizes
come from Resource Timing. Texture GPU estimates come from the manifest's
deterministic RGBA dimensions plus a 4/3 mip-chain allowance; Resource Timing's
`decodedBodySize` is not presented as decoded GPU memory.

## Post-Phase-9 baseline

The first production sample used multi-pass Unreal bloom at medium and high:

| Measurement                 | Phase 9 baseline |
| --------------------------- | ---------------: |
| Root shared JS, gzip        |        172,080 B |
| Explore 3D dynamic JS, gzip |        251,368 B |
| Low average FPS             |            28.76 |
| Medium average FPS          |             6.84 |
| High average FPS            |             6.69 |

This established post-processing as the dominant regression. The audit also
found that every planet rebuilt osculating elements and allocated transient
position objects in every frame.

## Accepted budgets

These thresholds are regression budgets derived from the measured build, not
aspirational or fabricated device claims.

| Area                                      | Budget               |
| ----------------------------------------- | -------------------- |
| Initial Home JS transfer                  | ≤ 260 KiB            |
| Root shared JS, gzip                      | ≤ 180 KiB            |
| Explore 3D dynamic JS, gzip               | ≤ 260 KiB            |
| Cold Explore script transfer              | ≤ 525 KiB            |
| Home texture transfer                     | 0                    |
| Low / medium / focused-high texture       | ≤ 50 / 200 / 310 KiB |
| Low / medium / worst focused-high mip GPU | ≤ 2 / 7 / 20 MiB     |
| DPR maximum, low / medium / high          | 1 / 1.25 / 1.5       |
| SwiftShader average FPS                   | ≥ 25 / 18 / 10       |
| Draw calls                                | ≤ 22                 |
| Geometry / material / visible objects     | ≤ 40 / 40 / 60       |
| Shader programs                           | ≤ 14                 |
| Triangles, low / medium / high            | ≤ 4k / 8k / 16k      |
| JS heap after focused scene               | ≤ 12 MiB             |
| Initial Explore API requests              | 1 ephemeris request  |
| Duplicate initial texture requests        | 0                    |

## Runtime audit checklist

- Confirm no frame-loop React or Zustand writes.
- Compile invariant orbital data outside the frame loop and reuse one mutable
  position tuple per planet.
- Share textures by path, reference-count leases, delay disposal during rapid
  focus changes, evict failures and dispose late loads.
- Dispose post-processing resources and scene textures on teardown.
- Verify leaving Explore removes the live canvas; verify browser back/forward
  reuses one scene rather than accumulating canvases.
- Switch hidden and reduced-motion documents to demand rendering.
- Keep the 3D dynamic chunk and all scene textures out of initial Home.
- Count initial API and texture requests in production E2E.

## Accessibility audit checklist

- Automated WCAG A/AA scan on Home, Explore, one planet, Compare and Data.
- Heading/landmark and form-label review.
- Visible keyboard focus, selection, Escape and focus restoration.
- Canvas-independent semantic planet buttons and readable selected summary.
- Reduced-motion static scene contract.
- WebGL-unavailable semantic fallback.
- 200% layout equivalent at 720 CSS px without horizontal overflow.
- Mobile touch targets and direct scene touch input.
- Status conveyed by text/ARIA as well as colour.
