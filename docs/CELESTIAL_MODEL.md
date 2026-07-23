# Celestial Model

## Gate 3B catalogue

The visual registry contains 48 non-Sun/non-planet bodies:

- 22 featured planetary moons;
- 4 main-belt worlds;
- 8 dwarf/Kuiper bodies;
- 6 comets;
- 8 dwarf-system satellites.

## Rotation truth

Rotation is typed as `periodic`, `tidally-locked` or `fixed-unknown`.

- Featured moons derive rotation directly from `MOON_BY_ID[id].rotation.kind`.
- Nereid is `unknown` in the moon catalogue and therefore `fixed-unknown` in the visual registry and acceptance probe.
- Charon is the only dwarf-system satellite currently asserted as tidally locked.
- An unknown state remains fixed and carries an explicit source/note; it is never randomized or inferred from category.
- Periodic rotation is evaluated from the shared simulation timestamp, so A → B → A time travel returns to the same orientation.

## Scale and framing

`test-artifacts/gate3b-scale-audit.json` is the machine-readable audit. Each row records:

- body and parent IDs;
- physical radius;
- rendered Explore and Scientific radius;
- visual amplification;
- parent distance and orbit extent;
- focus radius, visual geometry bounds and parent-system extent;
- representation status and flags.

Scientific body radius amplification must be 1. Dwarf-system satellite metrics are shared between renderer and audit, preventing the diagnostic table from drifting from runtime math. A row fails when values are non-finite, geometry reaches the parent origin or focus distance is inside the geometry. Procedural surfaces remain `review` until manual GPU acceptance.

## Representation labels

- `real-map`: source pixels imported and transformed with recorded provenance.
- `derived-map`: a scientific source product was transformed into a runtime map with recorded operations.
- `procedural-reconstruction`: deterministic Helios-created appearance informed by cited observations; no source pixels are claimed.
- `fixed-unknown`: orientation/rotation is intentionally unresolved.

## Dwarf-satellite orbit planes

Dwarf-satellite inclination is always qualified by its reference plane. Charon uses a source-backed near-zero inclination to Pluto's equator. Hiʻiaka and Namaka use source-backed inclinations of 2° and 13° to Haumea's equator. Dysnomia, MK2, Weywot, Xiangliu and Vanth remain `representative-parent-equatorial-unresolved`; the renderer does not convert an ecliptic or sky-plane inclination into a parent-equatorial claim.

The catalogue exposes `orbitPlaneStatus`, `orbitPlaneReference`, `orbitPlaneSourceId` and `orbitPlaneSourceUrl`. Acceptance probes and scale audits must use that status rather than treating every numeric default plane as resolved.

## Comet appearance

Comet motion and activity remain driven by the shared timestamp and anti-solar direction evaluator. Visual tails use deterministic soft particle volumes: a broad irregular dust population, a narrow ion population and a nucleus-centred coma with radial falloff. Tail extent is excluded from camera focus bounds. Cone geometry and hard transparent coma shells are not accepted runtime representations.

## Orbit geometry and date-position accuracy

Rendered orbit paths and time propagation share the same orbital element model, but they intentionally use different parameters for different jobs:

- date positions advance mean anomaly and solve Kepler's equation, preserving two-body timing;
- line geometry samples eccentric anomaly densely, applies the final scene scale, then re-samples the closed curve by rendered arc length;
- this prevents highly eccentric comet paths from becoming long straight perihelion or closure chords under the non-linear Explore distance scale;
- every orbit remains a solid line. Selection changes opacity and width; it does not switch to dashed geometry.

`test-artifacts/gate3b-orbit-accuracy-audit.json` covers all 56 moving bodies and 82 mode-specific path rows. It records closure, finite coordinates, maximum chord ratio, segment uniformity and distance from the date-evaluated position to the rendered curve.

Accuracy claims remain deliberately narrower than geometry acceptance:

- planet states are high fidelity only at a source Horizons vector or inside a returned Horizons sample window;
- outside that window, planet motion is a bounded osculating preview;
- planetary moon mean elements describe general shape and orientation and are not an ephemeris;
- asteroid, dwarf/Kuiper and comet frozen elements are two-body previews; comet non-gravitational acceleration and planetary perturbations are not integrated;
- dwarf-system satellite timing and unresolved planes remain representative.

A visually smooth and internally consistent orbit must therefore not be labelled date-accurate unless a Horizons-backed time window supports that claim.
