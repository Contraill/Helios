# Extended-body element and source table

The existing 18-body scope is unchanged. Every rendered individual orbit uses all six elliptic elements and one shared evaluator for both mesh position and path samples. No missing node/periapsis angle is randomized.

| Body                      | Kind          |    Target |       a (AU) |          e |     i (°) |     Ω (°) |     ω (°) |      M₀ (°) |                Epoch JDTDB | Status                       | Provenance                                     |
| ------------------------- | ------------- | --------: | -----------: | ---------: | --------: | --------: | --------: | ----------: | -------------------------: | ---------------------------- | ---------------------------------------------- |
| Ceres                     | dwarf-planet  |         1 |    2.7653485 | 0.07913825 |  10.58682 |   80.3932 |  72.58981 | 113.4104434 | 2455400.5 | representative-mean-elements | JPL published sample                           |
| Vesta                     | asteroid      |         4 |       2.3615 |    0.08874 |    7.1404 |  103.8514 |   150.987 |         151 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Pallas                    | asteroid      |         2 |    2.7721532 | 0.23099956 |   34.8409 |  173.1295 | 310.15094 |   96.148266 | 2455400.5 | representative-mean-elements | JPL published sample                           |
| Hygiea                    | asteroid      |        10 |        3.141 |      0.112 |      3.83 |     283.2 |     312.3 |         248 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Pluto                     | dwarf-planet  |    134340 |       39.482 |     0.2488 |     17.16 |   110.299 |   113.834 |       14.53 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Eris                      | dwarf-planet  |    136199 |        67.78 |     0.4407 |     44.04 |    35.951 |   151.639 |         205 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Haumea                    | dwarf-planet  |    136108 |       43.218 |      0.191 |     28.19 |     121.9 |     240.8 |         219 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Makemake                  | dwarf-planet  |    136472 |        45.43 |      0.159 |     28.98 |     79.62 |    294.83 |         165 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Quaoar                    | kuiper-object |     50000 |        43.69 |      0.039 |      7.99 |     188.9 |     147.5 |         112 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Gonggong                  | kuiper-object |    225088 |         67.5 |        0.5 |      30.7 |     336.8 |     207.7 |          96 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Sedna                     | kuiper-object |     90377 |        506.8 |      0.855 |     11.93 |    144.55 |     311.5 |         358 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Orcus                     | kuiper-object |     90482 |        39.17 |      0.227 |     20.59 |     268.8 |      72.3 |         181 |      2451545.0 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Halley                    | comet         |        1P | 17.834145081 | 0.96714291 | 162.26269 |  58.42008 | 111.33249 |           0 |            2446467.3953125 | representative-mean-elements | JPL published sample                           |
| Hale–Bopp                 | comet         | C/1995 O1 |        182.8 |      0.995 |      89.4 |    282.47 |    130.59 |           0 |                  2450539.5 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Encke                     | comet         |        2P | 2.2144931404 | 0.84833156 |  11.78308 | 334.56582 |  186.5497 |           0 |             2455415.001956 | representative-mean-elements | JPL published sample                           |
| 67P/Churyumov–Gerasimenko | comet         |       67P |       3.4624 |      0.641 |      7.04 |     50.18 |     12.78 |           0 |                  2459520.5 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| NEOWISE                   | comet         | C/2020 F3 |      368.475 |     0.9992 |    128.94 |     61.01 |     37.28 |           0 |                  2459033.5 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |
| Tempel 1                  | comet         |        9P |      3.19255 |      0.517 |     10.47 |     68.93 |    178.84 |           0 |                  2459642.5 | verified-fallback            | accepted frozen fallback; JPL re-fetch pending |

## Interpretation limits

- Ceres, Pallas, Halley and Encke use element examples published directly by JPL.
- Other records preserve the accepted six-element catalogue as explicit `verified-fallback` previews because a fresh SBDB payload could not be retrieved in the build environment.
- All records are two-body visual previews. Planetary perturbations, non-gravitational comet terms and navigation-grade uncertainty propagation are out of scope.
- Hyperbolic/parabolic solving is not fabricated; the current accepted set remains elliptic (`0 ≤ e < 1`).
