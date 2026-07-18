# Phase 9 — Visual depth plan and asset manifest

Date: 2026-07-18  
Prerequisite: C0 PASS (format, lint, typecheck, 158 unit tests, production build and 85 Chromium E2E tests).

## Pre-implementation audit

- The Explore route was the only route that loaded Three.js, through a client-only dynamic import. This boundary must remain intact so the home route does not acquire a 3D bundle.
- Planets were colour-only `MeshStandardMaterial` spheres. The Sun was a flat emissive sphere. There were no surface maps, atmosphere shells, rings or post-processing passes.
- Low, medium and high quality changed DPR and geometry counts but did not control texture resolution or visual effects.
- Camera input already had one authority (`OrbitControls`) and accepted pointer, wheel and touch input. Planet hit targets were separate transparent meshes.
- WebGL failure already preserved the semantic planet navigator through the DOM fallback.

## Implementation contract

1. Every rendered body receives an explicit manifest entry. A manifest entry identifies the official source or official visual reference, provider, representation type, attribution and all local variants.
2. Surface textures are colour data and use sRGB. They are never presented as unqualified photographs: enhanced-colour, radar-derived, composite and simulated maps are labelled.
3. Low loads 256×128 maps and no bloom. Medium loads 512×256 maps. High uses medium maps in the overview and promotes only the selected body to its high variant. This avoids replacing every scene texture at once.
4. A failed texture request leaves the existing body-colour material visible. Texture acquisition is shared and reference-counted; release is delayed to avoid churn during rapid quality/selection changes.
5. Atmospheres are separate shells. Mercury has none. Reduced motion removes animated/pulsing effects; low quality uses a cheaper transparent shell.
6. Saturn's rings are a separate, double-sided alpha surface parented inside Saturn's axial-tilt group. The inner and outer radii are 1.24 and 2.27 Saturn radii.
7. Bloom is scoped to the Explore canvas and disabled for low/medium quality and reduced motion. High is the explicit enhanced-effects tier.

## Asset sources and representation

The NASA 3D Resources repository revision used for the source maps is `11ebb4ee043715aefbba6aeec8a61746fad67fa7`. NASA media usage remains subject to the [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

| Body         | Official source/reference                | Representation in Helios                                                                        |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Sun          | NASA SDO, PIA26681                       | Procedural simulation derived from an official SDO visual reference; not an observation texture |
| Mercury      | NASA MESSENGER, PIA17386                 | Enhanced-colour global mosaic                                                                   |
| Venus        | NASA Magellan / NASA 3D Resources        | Radar-derived global composite                                                                  |
| Earth        | NASA/USGS / NASA 3D Resources, Earth (A) | Topographic-colour global composite                                                             |
| Mars         | NASA Viking/USGS / NASA 3D Resources     | Global imaging composite                                                                        |
| Jupiter      | NASA Voyager / NASA 3D Resources         | Global imaging composite                                                                        |
| Saturn       | JPL / NASA 3D Resources                  | Simulated map supplied by NASA's official asset catalogue                                       |
| Uranus       | NASA Voyager 2, PIA01391                 | Procedural simulation based on an official true-colour visual reference                         |
| Neptune      | Don Davis/JPL / NASA 3D Resources        | Simulated map supplied by NASA's official asset catalogue                                       |
| Saturn rings | NASA Saturn facts/Cassini reference      | Procedural alpha simulation; geometry and banding are explanatory                               |

The exact URLs, local paths, dimensions and attribution strings are machine-readable in `src/content/sources/planet-textures.ts`.

## Decoded texture cost

The values below are deterministic RGBA decode estimates (`width × height × 4`), not browser GPU measurements:

- each low surface: 0.125 MiB;
- each medium surface: 0.5 MiB;
- high Mercury: 8 MiB;
- high Venus, Earth or Mars: 3.96 MiB each;
- high Jupiter, Saturn or Neptune: 0.99 MiB each;
- high procedural Sun or Uranus: 2 MiB each.

Runtime memory, frame rate, bundle size and route behaviour are measured rather than inferred during Phase 10.
