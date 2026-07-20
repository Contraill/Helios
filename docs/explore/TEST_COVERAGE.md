# Explore control-foundation test coverage

The gate favours a few scenario-level tests over repeating the same invariant at
unit, component and E2E layers.

## Scenario coverage

1. **Bootstrap and asset lifecycle** — renderer, Sun-first staging, eight primary
   planets, material application, first complete frame, isolated Mars failure,
   background stage and production probe gating.
2. **Time workflow** — draft ownership during 250 ms publication, scrub preview,
   explicit Apply, URL/request continuity, pause/resume, speed, tab switching and
   return to now.
3. **View profile** — identical texture/material identity, preserved selection
   and timestamp, typed Explore/Scientific profile differences and automatic
   reduced motion.
4. **Persistence migration** — old quality/motion/panel data removal without a
   hydration error while supported exploration fields remain.
5. **Responsive functional smoke** — desktop, constrained height, mobile Time
   sheet and one targeted high-DPR regression viewport.
6. **Renderer evidence** — hidden-body policy, selected extended body continuity,
   mounted orbit instrumentation, Earth city-light day/terminator/night rejection.
7. **Asset audit** — dimensions, byte size, owner/attribution, 2K ceiling,
   physical orphans, dynamic manifest references and stale variant paths.

## General gates

- format;
- lint;
- strict typecheck;
- focused unit/integration suite;
- production build;
- Chromium functional smoke and visual evidence;
- fresh bundle apply and byte-for-byte reproducibility;
- package checksum.

Firefox/WebKit absence is recorded as an external cross-engine gap rather than a
reason to weaken Chromium or repository acceptance.
