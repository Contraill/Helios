# Helios Roadmap

This file is the repository-tracked source of truth for active quality gates.

## Active gates

| Gate                                             | Status      | Acceptance boundary                                                                                                                                                                       |
| ------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gate 1 — Visibility and scene lifecycle          | Complete    | Visibility ownership, mount/unmount policy, staged asset lifecycle and retired visual controls remain stable.                                                                             |
| Gate 2 — Selection, pointer and camera ownership | Complete    | A single selection authority, pointer contract, camera target registry and user-control handoff remain stable.                                                                            |
| Gate 3A — Regions & Context                      | Complete    | Asteroid/Kuiper/Oort/heliosphere context uses the fixed Detailed/Cinematic contract; retired density/representation controls and zodiacal context stay removed.                           |
| Gate 3B — Non-Sun / Non-Planet Visual Audit      | Open        | Featured moons, dwarf systems, asteroids, dwarf/Kuiper bodies, comets and non-Saturn ring systems must pass provenance, geometry, scale, orbit, framing, texture and real-GPU acceptance. |
| Gate 4 — Background and Galactic Context         | Not started | Background star treatment, far-zoom Galactic Context and the accepted Milky Way/“You are here” experience. Do not start until Gate 3B is explicitly accepted.                             |

## Gate 3B closeout checklist

- Featured-moon rotation metadata is derived from `moon-catalogue.ts`; unknown states are never promoted to tidal lock.
- Comet dust/ion tails and coma use soft particle volumes rather than cone/sphere prototype geometry.
- Charon, Hiʻiaka and Namaka use source-backed parent-equatorial inclinations; five remaining dwarf-satellite planes stay explicitly representative/unresolved until a compatible source is accepted.
- Fallback/final texture transition has deterministic depth separation and no coplanar crossfade.
- `test-artifacts/gate3b-scale-audit.json` covers all 48 bodies with zero `fail` rows.
- Scientific mode has a visual amplification ratio of 1 for body radii and parent-relative satellite orbits.
- Official NASA/JPL/USGS/ESA map candidates are imported only through the reviewed, bounded derivative pipeline; unimported products are never labelled as runtime maps.
- Procedural reconstructions remain explicitly labelled and visually distinct where no accepted source-derived runtime asset exists.
- Focused Vitest, `pnpm verify`, `pnpm build`, focused Playwright and full Playwright pass with no unexpected, flaky or skipped tests.
- Manual 1440×900 GPU review confirms silhouettes, seams, crossfade stability, tails, rings, focus distance and parent-system framing.

Gate 3B may be changed to **Complete** only after every checklist item has evidence. Code presence alone is not acceptance.

## Later work

After Gate 3B, proceed to Gate 4. Sun prominence polish, Time panel refinement, hidden-body callback optimization and later editorial/NASA/data work remain separately scheduled; they must not be folded into Gate 3B without an explicit scope change.
