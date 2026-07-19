# Helios scene cleanup — 2026-07-19

## Scope

This pass audits the extended-system patch with emphasis on camera authority,
label scale, progressive disclosure, scientific-mode legibility, texture
continuity and CI stability.

## Corrected root causes

- Free camera pan state was overwritten with the previous guided target on
  every frame. OrbitControls now owns its target continuously while free.
- Damped camera input could keep moving after wheel/pinch release. Direct
  camera input is deterministic and stops with the gesture.
- A tap and a drag shared the same transition. A five-pixel gesture threshold
  keeps taps available for body selection and hands real drags to the camera.
- Physical region radii were reused as camera framing radii. Asteroid belt,
  Kuiper belt, Oort cloud and heliosphere now keep their physical geometry but
  use bounded, explicit framing metadata.
- Every extended context layer was enabled on first load. Asteroid and Kuiper
  structure remain visible; comets, Oort, dust and heliosphere are opt-in and
  automatically reveal when selected.
- All extended-body orbit paths were rendered together. A featured orbit and
  comet trail are now disclosed only for the active body.
- Voyager, Parker and DONKI used full planetary scene labels simultaneously.
  Their context remains in the information panel and compact markers, without
  permanent viewport-sized text.
- Passive scientific labels and planet markers were too large and always
  overlaid geometry. They now use separate passive/active sizing and passive
  depth testing.
- Belt orbital planes shared one line of nodes. Deterministic ascending-node
  distribution now produces a sparse, inclined volume instead of a flat fan.
- Earth night-light extraction was too weak for compressed neutral city
  clusters. The shader now combines neutral and amber signals while rejecting
  the blue basemap and retains the anti-solar terminator.
- The GIBS capabilities document exceeded Next's per-item fetch-cache limit.
  The oversized raw XML bypasses that cache; the small parsed page model keeps
  the existing page-level caching behavior.

## GitHub Actions failures addressed

The failing run had 102 passing and 3 failing Playwright tests. The three
failures were corrected as follows:

1. Touch camera coverage now performs a genuine pointer drag, matching the
   tap-versus-drag product contract.
2. The one-year-per-second clock assertion polls the rendered clock instead of
   assuming an exact CI scheduler wake-up after 1.1 seconds.
3. The Jupiter weight assertion targets the result field instead of matching
   `177` inside unrelated NASA editorial copy.

## Verification

- Prettier: passed for changed files
- ESLint: passed for the complete project
- TypeScript and generated Next route types: passed
- Vitest: 46 files, 190 tests passed
- Next.js production build: passed; 36 static pages generated
- GitHub failure log reviewed: run `29668240329`, Playwright job
  `88142465643`

The local environment does not contain a Playwright Chromium binary, so the
full browser suite is expected to run in GitHub Actions after this archive is
pushed. The production build and the exact three failing scenarios have been
validated at source/test-contract level.
