# Asset and Source Policy

## Current celestial asset state

The runtime registry distinguishes `procedural-reconstruction`, `derived-map` and `real-map`. An official product page or citation alone never changes the runtime classification. Source pixels or shape data must be imported, transformed, bounded, hashed, orientation-calibrated and recorded before the registry may claim a source-derived asset.

The current reference-guided asset pipeline uses body-specific terrain, crater, fault, frost, albedo and landmark treatments rather than a shared blurred-noise family. The same bounded runtime surface derivatives may be reused as CSS editorial portraits on body, planet and comparison pages; this creates no second asset or attribution path. One-dimensional scene ring strips are not stretched into editorial ellipses; Saturn’s page portrait uses a lightweight CSS band treatment while the sourced strip remains reserved for the 3D ring geometry. `test-artifacts/texture-distinctiveness-audit.json` is a duplication warning tool, not a substitute for GPU review.

## Reviewed official products

The machine-readable ledger is `docs/data/celestial-source-research.json`. It covers the complete 48-body visual registry. Eighteen bodies currently have reviewed global-raster import candidates: the Moon, Phobos, the four Galilean moons, Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus, Triton, Pluto, Charon, Ceres and Vesta. The other 30 entries retain official imagery, shape or physical references while remaining explicitly procedural until a compatible full-global raster or compatible source-derived runtime shape exists.

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
9. requires a real-GPU catalogue review before release acceptance.

A partial import reports failures in `test-artifacts/celestial-official-asset-import.json`. Use `--strict` for an all-or-nothing selected set.

## Runtime limits

- 2K maximum for primary Sun/planet maps.
- 1K maximum for featured secondary maps.
- 512 default for smaller secondary bodies.
- Larger source masters must never be copied into `public/`.
- Every runtime asset records dimensions, byte size, SHA-256, provider, source ID, attribution, license, projection and prime-meridian state in `scripts/data/texture-runtime-manifest.json`.

## Galactic context surface

`public/textures/context/milky-way-exterior-v1.webp` is a 1024 × 1024,
44 KB reference-guided illustrative surface, not an observation of the Milky
Way from outside. Its composition follows the NASA/JPL barred-spiral concept:
two dominant stellar arms, two weaker gas-rich arms, an elongated central bar,
restrained blue star-forming regions and dark dust lanes. The runtime keeps the
scientific structure and the Solar System marker separate from the image: code
enforces the arm-count contract and places the warm marker on the Orion Spur at
a 26,000-light-year galactocentric distance.

Model references:

- [NASA Milky Way overview](https://science.nasa.gov/resource/the-milky-way-galaxy/)
- [NASA Solar System facts](https://science.nasa.gov/solar-system/solar-system-facts/)
- [JPL Milky Way artist concept](https://www.jpl.nasa.gov/images/pia10748-our-milky-way-gets-a-makeover-artist-concept/)

## Acceptance checklist

Before accepting a source-derived body:

1. confirm official product and reuse terms;
2. preserve source URL and source SHA-256;
3. inspect seam, poles, east/west longitude conversion and landmark orientation;
4. compare Explore and Scientific framing;
5. inspect texture loading/crossfade in the scene and cropping/contrast on the corresponding editorial pages;
6. retain evidence and run the full verification sequence.

## Source registry verification

Run:

```bash
pnpm audit:sources
pnpm audit:providers
```

The source audit rejects duplicate IDs/URLs, non-HTTPS references and unpaired EN/TR source notes. The provider audit separately validates official origins, documentation links, authentication, cache/timeout policy, pinned response versions and fallback classification. Network availability is verified only by the release probe documented in `API_ACCEPTANCE.md`.
