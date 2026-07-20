# Scientific source and frame matrix

| Source                                      | Fields used                                                                                    | Frame/time contract                                                                                                 | Product use                                                      | Boundary                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| JPL Planetary Satellite Mean Elements       | target code, source ephemeris, a/e/ω/M/i/Ω, TDB epoch, precession periods, Laplace pole RA/Dec | ecliptic, parent equatorial or local Laplace plane; node measured from the reference-plane node on the ICRF equator | 22 featured-moon representative previews                         | JPL explicitly warns that mean elements are not ephemerides           |
| JPL Planetary Satellite Physical Parameters | mean radii                                                                                     | reference physical data                                                                                             | moon physical/visual scale separation                            | not an orientation or position source                                 |
| JPL Horizons API/manual                     | state vectors, vector windows, reference system/plane, TDB time settings                       | ICRF/J2000 with explicit output plane and TDB                                                                       | bounded `horizons-window` planet states                          | accurate claim only inside returned sample window                     |
| JPL SBDB API and element tables             | target ID, six osculating elements, epoch                                                      | heliocentric J2000 ecliptic; TDB epoch                                                                              | labelled small-body two-body previews                            | not a long-term precision ephemeris                                   |
| NAIF SPICE Frames required reading          | inertial/body-fixed terminology and transform chain                                            | J2000/ICRF frame relationships                                                                                      | typed frame vocabulary and one conversion boundary               | Helios does not ship SPICE kernels in this gate                       |
| NAIF PCK required reading                   | body pole/orientation model concepts                                                           | time-varying body-fixed orientation                                                                                 | separates parent equatorial plane from texture/body-fixed claims | texture prime meridian remains unverified                             |
| IAU rotational-elements report (2015)       | pole/rotational-element authority                                                              | ICRF pole definitions                                                                                               | parent-pole and tidal-lock orientation authority                 | texture-facing longitude accuracy deferred to sourced Prompt 3 assets |

## Implemented matrix chain

1. Progress mean anomaly from the explicit TDB epoch.
2. Solve the elliptic Kepler equation with bounded Newton iterations and bisection fallback.
3. Build the perifocal point.
4. Apply argument of periapsis, inclination and ascending-node rotations.
5. Apply the explicit source-plane basis: ecliptic, parent equatorial or local Laplace plane.
6. Convert the resulting J2000 ecliptic vector once to Three.js y-up.
7. Apply the selected typed scene scale only at the final boundary.

The same evaluator supplies mesh position and orbit path samples. Parent axial orientation is not applied a second time to moon positions.
