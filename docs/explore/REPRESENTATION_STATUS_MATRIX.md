# Celestial representation status matrix

| Status                         | Meaning in Helios                                                                      | Current bodies/timestamps                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `horizons-window`              | Source state vectors interpolated inside the returned Horizons sample window           | planets only, when a verified Horizons window contains the simulation timestamp               |
| `latest-available`             | Near the source observation vector but without an enclosing interpolation window       | planets when the latest verified vector is used close to its observation time                 |
| `representative-mean-elements` | Published mean/osculating elements propagated for shape, phase and orientation preview | all 22 featured moons; Ceres, Pallas, Halley and Encke                                        |
| `propagated-preview`           | A source vector/orbit propagated outside its accurate window                           | planets outside a Horizons window where preview propagation remains supported                 |
| `verified-fallback`            | Accepted frozen fallback retained because the provider payload is unavailable          | static planet fallback and 14 extended-body catalogue snapshots                               |
| `unavailable`                  | No scientifically defensible position representation exists                            | reserved for missing/unsupported source records; never silently replaced with random elements |

## Accuracy statement

`Scientific` is a body/distance/effect profile, not an accuracy guarantee. Accuracy is communicated only through the representation status and its source/range metadata. Moon and small-body mean-element previews are never labelled live or navigation-grade.
