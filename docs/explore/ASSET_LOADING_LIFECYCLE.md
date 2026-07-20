# Explore asset-loading lifecycle

## Ownership

`asset-loading-lifecycle.ts` is an external snapshot store. It does not publish
frame-by-frame React state. The persistent Explore scene consumes it through
`useSyncExternalStore` only for coarse lifecycle transitions.

## Blocking primary stages

1. The mounted renderer is marked ready.
2. The canonical 2K Sun surface settles.
3. The eight canonical 2K planet surfaces settle concurrently.
4. Earth clouds, Earth city lights and Saturn's radial ring texture settle.
5. Each mounted owner reports that its texture or object-level fallback was
   committed to the real Three.js material.
6. `SceneReadinessReporter` observes a complete rendered frame after the latest
   material revision.

The opening layer closes only after all six conditions. HTTP completion alone is
not readiness.

## Failure isolation

Each primary asset has a 15-second bound and settles independently. A failure:

- marks only that owner degraded;
- commits the verified object-level fallback;
- never prevents other assets from settling;
- never leaves the opening layer indefinitely visible;
- remains observable in acceptance mode without exposing a technical dump to the user.

A late successful decode may replace the fallback and clear the degraded owner.

## Background stage

`SecondaryAssetScheduler` starts only after the primary stage. Its registry is
intentionally ready for featured moons, dwarfs, asteroids and comet visual
assets, but this integration does not add Prompt 3 assets. Selection, hover and
navigator context can promote an owner's queued work without reopening the
full-screen loader. Missing secondary assets use object-level fallback and may
crossfade when ready.

## Production instrumentation

`SceneAcceptanceProbe` is absent from normal production use. It mounts only for
`?acceptance=1` or the explicit `__HELIOS_ENABLE_SCENE_ACCEPTANCE__` test flag,
where it inspects mounted objects, materials, textures, orbit classes and GPU
program counts.
