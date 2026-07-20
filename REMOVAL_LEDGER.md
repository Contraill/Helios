# Explore removal ledger

This ledger records the control, state, test and runtime-asset paths removed by
the Explore control-foundation integration. Historical documentation remains
historical; no deprecated implementation is retained in executable source.

| Removed element                               | Kind                                       | Removed references                                                                                  | Storage / migration                                                                  | Replacement or reason                                                                    |
| --------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `SimulationControls`                          | Component and tests                        | `simulation-controls.tsx`, component tests, Explore imports, legacy control-deck CSS                | None                                                                                 | Time transport moved to `EphemerisPanel`; view-only controls moved to `ViewControls`.    |
| `EphemerisControls`                           | Component and tests                        | Old date/step UI and duplicate panel ownership                                                      | None                                                                                 | Replaced by persistent `EphemerisController` plus view-only `EphemerisPanel`.            |
| `ExtendedSystemControls`                      | Component                                  | Nested control surface and duplicated region ownership                                              | Removed panel state is ignored by current stores                                     | Objects are selected through `CelestialNavigator`; derived scene policy owns visibility. |
| User quality selector                         | UI, copy and tests                         | Render Quality fieldset, low/medium/high buttons, explanatory cards, CSS selectors                  | `qualityLevel` is deleted with the `helios-preferences` envelope before hydration    | One automatic `HIGH_VISUAL_CONTRACT`; runtime safety is not a user quality tier.         |
| User motion selector                          | UI, copy and tests                         | Motion fieldset, motion copy, manual reduced/full actions and CSS                                   | `motionPreference` is deleted with the legacy preference envelope                    | `prefers-reduced-motion` is observed automatically.                                      |
| `preferences-store`                           | Zustand store, actions and tests           | `qualityLevel`, `setQualityLevel`, `motionPreference`, `setMotionPreference`, panel expansion state | `migrateLegacyExplorePreferences` removes the obsolete envelope without hydrating it | Supported exploration/simulation stores remain versioned independently.                  |
| Texture variant resolver                      | Module and tests                           | `surface-texture-variant`, `TextureVariantName`, variant selection branches                         | Not applicable                                                                       | Every primary owner has one canonical runtime asset.                                     |
| Low/medium/high planet textures               | Physical runtime assets and manifest paths | 33 planet/layer variant files                                                                       | Not applicable                                                                       | Canonical 2048×1024 WebP surfaces and required 2K/skinny special layers.                 |
| Low/medium/high Saturn ring textures          | Physical runtime assets                    | Three square/variant paths                                                                          | Not applicable                                                                       | One 2048×125 radial ring texture.                                                        |
| Quality-specific Three.js branches            | Runtime component branches                 | Geometry, DPR, atmosphere, city-light shader define and texture selection variants                  | Not applicable                                                                       | Fixed high visual contract plus device-safe automatic resource management.               |
| `ScientificPlanetMarker`                      | Component                                  | Scientific target-icon representation and imports                                                   | Not applicable                                                                       | Scientific and Explore use the same celestial mesh/material representation.              |
| Nested collapse ownership                     | UI state, copy and CSS                     | Inner panel expansion controls and duplicated owner selectors                                       | Legacy expansion fields are removed during migration                                 | `ExploreSceneDock` owns one active panel: Selection, Navigator, View or Time.            |
| Simulation speed in Simulation panel          | UI ownership and tests                     | Speed readout/presets/pause/reset outside Time                                                      | Simulation store remains authoritative                                               | `EphemerisPanel` is the only visible owner of timestamp and transport.                   |
| Normal-production scene acceptance traversal  | Production runtime work                    | Unconditional renderer/material probe mount                                                         | Not applicable                                                                       | Probe mounts only with `?acceptance=1` or explicit test flag.                            |
| Stale quality/motion measurement permutations | Scripts and test paths                     | Phase 10 quality-loop permutations                                                                  | Not applicable                                                                       | Measurements use the single high visual contract.                                        |

## Repository-wide removal audit

The integration audit searches source, tests, scripts, runtime manifests and
physical assets for the following stale paths:

- `qualityLevel`, `setQualityLevel`, `motionPreference`, `setMotionPreference`;
- `TextureVariantName`, `textureVariant`, `surface-texture-variant`;
- `ScientificPlanetMarker`;
- low/medium/high celestial runtime paths;
- Render Quality and Motion UI copy;
- obsolete Simulation panel ownership and orphan CSS.

The only permitted legacy field mentions are migration fixtures proving that old
localStorage data is removed safely.
