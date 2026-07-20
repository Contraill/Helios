# Explore and Scientific scene profiles

Explore and Scientific are two typed profiles over one scene. They share the
renderer, registry, scene graph, texture paths, PBR/material instances,
selection, camera authority, ephemeris timestamp and orbital dataset.

`SCENE_PROFILES` is the single configuration boundary. A profile may change only:

1. body/readability scale values;
2. orbital/distance scale values;
3. cinematic effect intensity and framing values.

## Explore

- readable body profile;
- compressed distance profile;
- lower, non-zero bloom/corona/haze intensity;
- brighter exposure and closer framing;
- preserved atmosphere, clouds, city lights, rings and surface detail.

## Scientific

- physical-ratio body profile;
- shared-ratio distance profile;
- the cinematic high-contract reference: dark space, controlled bloom, haze,
  atmosphere and surface-preserving exposure;
- the same real celestial meshes, never target icons or alternate markers.

Components consume typed profile values. They do not independently decide what
“scientific” means, which prevents contradictory scale/effect branches.
