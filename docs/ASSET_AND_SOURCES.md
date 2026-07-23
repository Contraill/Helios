# Asset and Source Policy

## Current Gate 3B state

The runtime registry distinguishes `procedural-reconstruction`, `derived-map` and `real-map`. An official product page or citation alone never changes the runtime classification. Source pixels or shape data must be imported, transformed, bounded, hashed, orientation-calibrated and recorded before the registry may claim a source-derived asset.

The current procedural generator uses body-specific terrain, crater, fault, frost, albedo and landmark treatments rather than a shared blurred-noise family. `test-artifacts/gate3b-texture-distinctiveness.json` is a duplication warning tool, not a substitute for GPU review.

## Reviewed official products

The machine-readable ledger is `docs/data/celestial-source-research.json`. It covers the complete 48-body Gate 3B visual registry. Eighteen bodies currently have reviewed automatic global-raster candidates: the Moon, Phobos, the four Galilean moons, Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus, Triton, Pluto, Charon, Ceres and Vesta. The other 30 entries retain official imagery, shape or physical references while remaining explicitly procedural until a compatible full-global raster or accepted source-derived runtime shape exists.

Each raster entry records projection, longitude direction/domain, seam conversion, horizontal flip policy, no-data handling, download strategy and required manual review. Source URLs are reviewed candidates, not proof that their pixels ship in Helios.

## Official runtime importer

List automatic candidates:

```bash
pnpm assets:celestial:official:list
```

Import all reachable reviewed global rasters as bounded runtime derivatives:

```bash
pnpm assets:celestial:official
```

Import selected bodies and require every selected source to succeed:

```bash
python scripts/import-official-celestial-assets.py --apply --strict \
  --body moon-earth-moon \
  --body moon-mars-phobos \
  --body pluto \
  --body dwarf-satellite-charon
```

The importer is opt-in and transactional per successful derivative. It:

1. downloads only reviewed official candidates;
2. keeps source masters in `.cache/celestial-official`, outside `public/`;
3. rejects implausibly small or non-2:1 map products;
4. converts positive-west products, relocates 0–360 seams and documents every operation;
5. fills only configured no-data pixels from the prior procedural fallback;
6. writes 1K/512 bounded WebP derivatives;
7. updates runtime manifest, source ledger, registry override ledger, scale audit and texture-distinctiveness artifact;
8. leaves `primeMeridianVerified` false until manual landmark verification;
9. requires a real-GPU catalogue review before Gate acceptance.

A partial import reports failures in `test-artifacts/gate3b-official-asset-import.json`. Use `--strict` for an all-or-nothing selected set.

## Runtime limits

- 2K maximum for primary Sun/planet maps.
- 1K maximum for featured secondary maps.
- 512 default for smaller secondary bodies.
- Larger source masters must never be copied into `public/`.
- Every runtime asset records dimensions, byte size, SHA-256, provider, source ID, attribution, license, projection and prime-meridian state in `scripts/data/texture-runtime-manifest.json`.

## Acceptance checklist

Before accepting a source-derived body:

1. confirm official product and reuse terms;
2. preserve source URL and source SHA-256;
3. inspect seam, poles, east/west longitude conversion and landmark orientation;
4. compare Explore and Scientific framing;
5. inspect texture loading/crossfade on a real GPU;
6. retain evidence and run the full verification sequence.
