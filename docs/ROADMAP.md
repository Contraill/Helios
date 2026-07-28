# Helios Roadmap

This document is the repository source of truth. Implemented source is not the same as release acceptance: native build/test, provider connectivity and manual browser/GPU evidence remain separate checks.

## Current milestone map

| Milestone                                     | Implementation status    | Remaining acceptance                                                          |
| --------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| Visibility and scene lifecycle                | Complete                 | Preserve in the regression suite.                                             |
| Selection, pointer and camera ownership       | Complete                 | Native two-profile framing and real-device angle review.                      |
| Regions and context                           | Complete                 | Preserve in the regression suite.                                             |
| Non-Sun/non-planet visual catalogue           | Complete                 | Real-GPU catalogue review remains part of release evidence.                   |
| Semantic product completion                   | Complete                 | Native build, unit and E2E acceptance.                                        |
| Sun and Galactic Context                      | Complete                 | Manual GPU and screenshot acceptance.                                         |
| Editorial completion                          | Complete                 | Native browser visual-density and remote/fallback-state acceptance.           |
| Language, data, performance and documentation | Complete at source level | Native performance report and live provider probe.                            |
| Production acceptance and release             | Pending                  | Browser/device matrix, deployment, final evidence, version and release notes. |

The release candidate remains local until the project owner runs the native suite and any resulting regression is corrected.

## Completed product scope

### Semantic library

- 57 canonical `/body/[slug]` routes: Sun, eight planets, 22 featured moons, 18 extended bodies and eight dwarf-system satellites.
- Four `/region/[slug]` routes: asteroid belt, Kuiper belt, Oort cloud and heliosphere.
- `/planet/[slug]` and `/object/[slug]` compatibility routes canonicalised to `/body/[slug]`.
- Every Explore selection links to its semantic destination.
- Canonical metadata, 68-entry sitemap, robots policy and social preview images.

### Editorial surfaces

- Final home composition.
- Sourced Missions index.
- Eight custom planet compositions plus the shared body/region renderer, now using attributed local texture portraits and a restrained site-wide ambient backdrop. The Home system diagram uses exact SVG orbit geometry, and the ambient grid no longer paints against the viewport edge.
- Compare, Data, About and Case Study.
- Complete EN/TR visible copy, accessibility names, metadata, form/error states and locale formatting.

### Scene and simulation

- Persistent ephemeris clock, camera authority and transactional scene preferences. Extended-body focus waits for target registration, recalculates framing when the scale profile changes and uses target-scaled settle tolerances for physically tiny Scientific bodies.
- One High visual contract with bounded DPR and texture ceilings.
- Deterministic body/orbit catalogue, anti-solar comet tails, ring systems and Earth city-light rejection contract.
- Separate schematic Galactic Context with a labelled Solar System marker and lazy particle allocation.
- Anchored, deterministic, reduced-motion-aware solar prominence flow.

### External data

- Central contracts for 12 NASA/JPL provider families.
- Server-only authentication, timeout, cache/revalidation, Zod validation, normalisation and explicit fallback behavior.
- Pinned JPL CAD 1.5 and Fireball 1.2 response versions.
- InSight treated as a bundled dated historical landing-site snapshot; no retired runtime weather endpoint.
- Static provider/source audits and a network-enabled release probe.

### Quality and documentation

- Route, scene, import-boundary, language, provider, source, static-budget, editorial and texture audits.
- Active architecture, diagram, data acceptance, language, performance, limitations and release documents.
- Retired interim interfaces removed.

## Remaining work that requires the project owner's environment

### Native automated acceptance

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm build
pnpm exec playwright test --project=chromium --workers=2
pnpm audit:performance
NASA_API_KEY=... pnpm probe:providers:release
```

Resolve any native-only regression before proceeding.

### Manual browser and GPU acceptance

- Chromium desktop/mobile plus Firefox, Edge, Safari/iOS Safari and Android Chrome where available.
- Keyboard, screen-reader smoke, reduced motion, 200% zoom and WebGL fallback.
- Galactic Context transition/marker composition.
- Sun prominence contact, transparency, flow and corona interaction.
- Texture seams, city lights, rings, comet tails, labels, Tempel 1/extended-body focus in both scale profiles and touch/camera behavior.
- Slow-network and remote current/fallback/unavailable surfaces.

### Production release

- Set production `NASA_API_KEY` and `SITE_URL`.
- Verify canonical/social/sitemap/robots output on the deployed domain.
- Preserve native command, provider probe and performance reports.
- Capture final screenshots and demo video.
- Add measured results to Case Study, review licences, then create version and release notes.

## Deferred post-release scope

- Automated presentation tour.
- WebXR.
- User favourites.
- Advanced sonification.
- Surface exploration or landing experiences.
- Broad mission trajectory catalogue.
- Full N-body or navigation-grade simulation.
- Additional distant-system datasets and map products.
