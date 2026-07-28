# Performance Contract

## One visual contract

Helios ships one High visual contract. Runtime safety comes from bounded DPR, staged loading, texture ceilings, lazy Galactic Context allocation, reduced-motion handling and resource disposal—not from a user-facing quality selector.

## Static budgets

`config/performance-budgets.json` records source-verifiable limits:

- maximum DPR: 1.75;
- local star count: 1,800;
- orbit segments: 192;
- ring segments: 256;
- at most 64 runtime texture assets;
- primary and primary-layer textures: 2K × 1K ceiling;
- secondary surfaces: 2K × 1K ceiling;
- ring textures: 256 px vertical ceiling;
- 57 real bodies, four regions and 61 semantic detail destinations;
- 12 external-provider contracts;
- 68 canonical sitemap entries.

Run:

```bash
pnpm audit:budgets
pnpm audit:textures
pnpm audit:boundaries
```

These checks fail when the documented source contract grows silently. A deliberate change requires updating the budget file and documenting the measured reason.

## Production runtime measurement

Static checks do not prove frame rate, GPU memory or bundle size. A production build and native browser environment are required:

```bash
pnpm build
pnpm audit:performance
```

The release report records:

- first-load JavaScript for `/` and `/explore`;
- Explore route chunks;
- opening and peak texture residency;
- draw calls, triangles/geometries and shader programs;
- DPR and canvas dimensions;
- overview, selected-body and Galactic Context frame pacing;
- React commits during idle scene motion;
- repeated external-data request counts;
- route-exit disposal and repeated navigation behavior.

A missing observation is incomplete evidence, not a passing zero. Runtime thresholds are adopted only from the first clean target-device measurement and then added to the release record.

## Existing engineering guards

- Home and Missions must not reach the WebGL dependency graph.
- Galactic particle buffers are created only on first entry to Galactic Context.
- Frame loops mutate Three.js objects without per-frame React state writes.
- Hidden/background bodies avoid unnecessary selector, callback and material churn.
- Repeated route transitions must leave one live canvas and release scene resources after exit.
