# Helios Extended Solar System — 2026-07-19

## Delivered in this archive

- WebGL logarithmic-depth shader compilation fixed for the atmospheric and Earth night-light layers.
- Earth night lights use the 4096×2048 high source, a solar-terminator mask and corrected additive compositing (no double alpha attenuation).
- Milky Way rebuilt as a five-arm, warm-bulge/blue-disk procedural exterior with dust-lane separation. The extragalactic deep-field stage was removed and free-camera distance now ends at the Milky Way view.
- Scientific mode keeps the shared 1:1 AU/km scale for the Sun, planets, featured small bodies, ring dimensions and heliosphere distances. Visibility markers never change the physical mesh radius.
- Sparse main asteroid belt with sampled eccentricities and inclinations, selectable region, density controls and physical/cinematic representation controls.
- Ceres, Vesta, Pallas and Hygiea are selectable; Ceres is catalogued as a dwarf planet. Each featured body has a generated editorial route.
- Thick, inclined Kuiper distribution plus selectable Pluto, Eris, Haumea, Makemake, Quaoar, Gonggong, Sedna and Orcus.
- Halley, Hale–Bopp, Encke, 67P/Churyumov–Gerasimenko, NEOWISE and Tempel 1 use time-dependent Kepler previews. Their coma/tail visibility increases toward the Sun, and their separate dust/ion tails point anti-solar rather than along velocity.
- Inner and outer Oort samples are explicitly labelled inferred/schematic. Scientific distances span 2,000–100,000 AU without compressing the geometry; the camera itself remains capped at the Milky Way view.
- Quality-gated zodiacal dust, three Earth-crossing meteor-stream context rings and comet-orbit particle trails.
- Solar wind particles, termination shock, heliopause, Parker Solar Probe/Voyager context markers, a labelled DONKI-style Sun–Earth CME context cone, controlled corona and prominence layers.
- Extended-system layer toggles, sparse/standard/detailed density, selectable regions, keyboard-accessible featured bodies and 18 static editorial pages.

## Scientific representation notes

- The eight planets continue to use JPL Horizons vectors/windows already present in Helios.
- Featured extended bodies use published representative orbital elements with a deterministic two-body Kepler preview. They are not claimed as live Horizons vectors.
- Belt background particles are statistically sampled orbital populations, not a catalogue of current individual asteroid positions. “Cinematic” changes visible sampling only and is labelled non-literal.
- Oort Cloud geometry is inferred, not directly imaged. The layer carries `dataCertainty: inferred` and the interface states this uncertainty.
- The DONKI-style cone demonstrates the Sun-to-Earth event chain and is labelled context, not a live event or collision forecast.

## Verification

- Prettier format check: passed.
- ESLint: passed.
- TypeScript / Next route generation: passed.
- Vitest: 45 files, 186 tests passed.
- Production build: passed, including all 18 `/object/[slug]` static pages.
- Playwright discovery: 105 Chromium tests collected successfully, including the new extended-system interaction test.
- Full local Chromium execution was unavailable in the build container because no browser binary is installed. The two supplied CI failures were addressed directly: the clock assertion now polls under CI load, and the shader sources include Three's `<common>` chunk required by logarithmic depth.

## GitHub handoff

Run the following after extracting:

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm test:e2e
```

The GitHub Playwright job is the final browser/GPU gate. If that job finds a machine-specific WebGL issue, preserve its console output and screenshot artifacts; the release contains no intentionally ignored runtime error.
