# Moon representation table

All 22 accepted featured moons remain in scope. Every row is a `representative-mean-elements` preview, not a Horizons position. JPL target/ephemeris IDs and TDB epochs are retained so a future bounded Horizons window can replace the preview without changing celestial identity.

| Moon      | Parent  | JPL target | Source ephemeris | Reference frame         | Epoch            | Laplace pole                     | Representation               |
| --------- | ------- | ---------: | ---------------- | ----------------------- | ---------------- | -------------------------------- | ---------------------------- |
| Moon      | Earth   |        301 | DE405/LE405      | ecliptic-j2000          | 2000-01-01.5 TDB | —                                | representative mean elements |
| Phobos    | Mars    |        401 | MAR099           | local-laplace-plane     | 2000-01-01.5 TDB | RA 317.7°, Dec 52.9°, tilt 0°    | representative mean elements |
| Deimos    | Mars    |        402 | MAR099           | local-laplace-plane     | 2000-01-01.5 TDB | RA 316.6°, Dec 53.5°, tilt 0.9°  | representative mean elements |
| Io        | Jupiter |        501 | JUP365           | local-laplace-plane     | 2000-01-01.5 TDB | RA 268.1°, Dec 64.5°, tilt 0°    | representative mean elements |
| Europa    | Jupiter |        502 | JUP365           | local-laplace-plane     | 2000-01-01.5 TDB | RA 268.1°, Dec 64.5°, tilt 0°    | representative mean elements |
| Ganymede  | Jupiter |        503 | JUP365           | local-laplace-plane     | 2000-01-01.5 TDB | RA 268.2°, Dec 64.6°, tilt 0.1°  | representative mean elements |
| Callisto  | Jupiter |        504 | JUP365           | local-laplace-plane     | 2000-01-01.5 TDB | RA 268.7°, Dec 64.8°, tilt 0.4°  | representative mean elements |
| Mimas     | Saturn  |        601 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 40.6°, Dec 83.5°, tilt 0°     | representative mean elements |
| Enceladus | Saturn  |        602 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 40.6°, Dec 83.5°, tilt 0°     | representative mean elements |
| Tethys    | Saturn  |        603 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 40.6°, Dec 83.5°, tilt 0°     | representative mean elements |
| Dione     | Saturn  |        604 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 40.6°, Dec 83.5°, tilt 0°     | representative mean elements |
| Rhea      | Saturn  |        605 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 40.6°, Dec 83.5°, tilt 0°     | representative mean elements |
| Titan     | Saturn  |        606 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 36.4°, Dec 84°, tilt 0.6°     | representative mean elements |
| Iapetus   | Saturn  |        608 | SAT441           | local-laplace-plane     | 2000-01-01.5 TDB | RA 288.7°, Dec 78.9°, tilt 14.8° | representative mean elements |
| Miranda   | Uranus  |        705 | URA182           | parent-equatorial-j2000 | 2000-01-01.5 TDB | —                                | representative mean elements |
| Ariel     | Uranus  |        701 | URA182           | parent-equatorial-j2000 | 2000-01-01.5 TDB | —                                | representative mean elements |
| Umbriel   | Uranus  |        702 | URA182           | parent-equatorial-j2000 | 2000-01-01.5 TDB | —                                | representative mean elements |
| Titania   | Uranus  |        703 | URA182           | parent-equatorial-j2000 | 2000-01-01.5 TDB | —                                | representative mean elements |
| Oberon    | Uranus  |        704 | URA182           | parent-equatorial-j2000 | 2000-01-01.5 TDB | —                                | representative mean elements |
| Proteus   | Neptune |        808 | NEP097           | local-laplace-plane     | 2000-01-01.5 TDB | RA 299.8°, Dec 42.6°, tilt 0.9°  | representative mean elements |
| Triton    | Neptune |        801 | NEP097           | local-laplace-plane     | 2000-01-01.5 TDB | RA 299.8°, Dec 43.1°, tilt 0.4°  | representative mean elements |
| Nereid    | Neptune |        802 | NEP105           | ecliptic-j2000          | 2020-01-01.0 TDB | —                                | representative mean elements |

## Orientation limits

- Tidal locking uses the transformed parent direction and orbit normal.
- IAU pole/rotation metadata identifies the orientation authority.
- Texture prime-meridian alignment is explicitly unverified until Prompt 3 supplies sourced assets.
- Mean-element precession periods are metadata only; the renderer does not pretend to be a full perturbation integrator.
