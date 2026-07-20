# Prompt 2 scientific acceptance report

## Scope

This gate builds on the accepted Prompt 1 control/asset architecture. It does not add Prompt 3 textures, moons, dwarf worlds, comet nuclei, custom meshes or 3D models.

## Baseline runtime repair

- `/data` remains static/revalidated.
- The large raw GIBS capabilities XML bypasses the Next fetch cache.
- Only the compact normalized layer model is wrapped by `unstable_cache`.
- Verified fallback survives provider/network failure.
- A production-server request produced no static-to-dynamic, `DYNAMIC_SERVER_USAGE` or `no-store` runtime error.
- The final opening-loader phase is labelled `Preparing final layers` after the planet counter reaches 8/8.

## Scientific representation

- Typed states: `horizons-window`, `latest-available`, `representative-mean-elements`, `propagated-preview`, `verified-fallback`, `unavailable`.
- `Scientific` is a visual/scale profile, not an accuracy claim.
- Accurate status is limited to source-vector interpolation inside a returned Horizons window.
- All 22 featured moons use explicitly labelled JPL mean-element previews.
- Ceres, Pallas, Halley and Encke use JPL-published sample elements.
- The other accepted extended records remain explicit fallback previews and are not presented as current JPL ephemerides.

## Frame and evaluator contract

- Explicit ecliptic, parent-equatorial and local-Laplace frame metadata.
- JPL node convention: ascending-node longitude measured from the reference-plane node on the ICRF equator.
- TDB epochs replace misleading UTC epoch naming.
- One bounded elliptic Kepler evaluator supplies body position and path samples.
- One J2000-ecliptic → Three.js y-up conversion is applied before final typed scene scale.
- Parent axial orientation is not applied twice.
- Tidal lock uses transformed parent direction and orbit normal with a stable singularity fallback.

## Extended bodies and comets

- Existing 18-body scope preserved.
- Six elliptic elements, epoch, time scale, reference frame, target/source and representation state are explicit.
- Missing angles are never randomized.
- High-e elliptic solving uses bounded Newton iterations and bisection fallback.
- Comet tail state uses the actual anti-solar vector and bounded heliocentric-distance activity.
- Hyperbolic/parabolic support is not fabricated.

## Runtime and renderer

- Sun, planets, moons, extended bodies and orbit paths consume the shared simulation timestamp.
- Pause freezes secondary orbital motion while camera interaction remains available.
- Explore/Scientific switching preserves timestamp, selected body, orbital phase and material identity.
- Static representative `Line2` resources are reused; hidden bodies remain filtered at the parent policy boundary.
- Acceptance-only instrumentation measures real mounted body positions, orbit resource UUIDs/bounds and comet state.

## Validation

- Format: passed.
- ESLint: passed.
- Strict typecheck and generated Next route types: passed.
- Unit/integration: 56 files, 212 tests passed.
- Runtime texture audit: 12 assets, 0 errors, 0 warnings.
- Production build: passed in verified snapshot mode; 36 static/SSG outputs, `/data` remains static/revalidated.
- Targeted Chromium: shared time/profile/orbit identity, comet anti-solar state, distinct extended orbit planes, `/data` runtime and selected-Ceres orbit continuity passed.
- Production server log: no static-to-dynamic error.

## Limits

- Moon mean elements are representative, not ephemerides.
- Small-body two-body previews omit perturbations, uncertainty and comet non-gravitational terms.
- Texture prime-meridian accuracy is unverified until Prompt 3 supplies sourced assets.
- Serverless Chromium/SwiftShader is not a native-GPU performance measurement.
- Firefox/WebKit, iOS/Android and real-device/GPU validation remain external checks.
