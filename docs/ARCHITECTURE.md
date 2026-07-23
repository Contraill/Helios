# Helios Architecture

## Runtime contract

Helios uses Next.js App Router, strict TypeScript, React Three Fiber/Three.js, Zustand, Zod, Vitest and Playwright. Server code owns external data retrieval, validation and cache policy. Client stores contain bounded interaction state, not duplicated scientific truth.

## Explore scene authority

- One persistent simulation timestamp drives planets, moons, dwarf systems, comets and deterministic rotations.
- Selection, camera targets, visibility and simulation controls have single owners.
- Components publish target metadata; they do not independently seize the camera.
- Frame loops mutate Three.js objects without per-frame React state writes.
- Orbit geometry/material objects are stable across visibility and emphasis changes.

## One High visual contract

There is no user-facing Low/Medium/High selector and no persisted quality preference. The shipped contract is High. Resource management is automatic and bounded by:

- primary Sun/planet surfaces: 2K runtime ceiling;
- featured secondary surfaces: 1K ceiling;
- smaller asteroid/satellite surfaces: 512 ceiling;
- staged blocking-primary and background-secondary loading;
- reduced-motion and runtime capability handling without presenting a quality control.

Explore and Scientific use the same renderer, materials and source assets. Their accepted differences are scale/distance presentation and restrained effect intensity. Scientific uses a shared physical ratio; Explore amplifies readability without claiming physical scale.

## Asset and diagnostic boundaries

`celestial-visual-registry.ts` owns visual geometry, surface classification, orientation and rotation metadata. Scientific rotation truth comes from the body catalogue or a named source, never from category defaults. Test-only catalogues and scene probes are gated by `sceneTest=1` and do not add production UI.

See `CELESTIAL_MODEL.md` and `ASSET_AND_SOURCES.md` for the 48-body audit and provenance policy.
