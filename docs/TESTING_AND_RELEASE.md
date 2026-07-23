# Testing and Release

## Required command order

```bash
pnpm verify
pnpm build
pnpm exec playwright test e2e/gate3b-celestial-visuals.spec.ts e2e/gate3-regions-context.spec.ts e2e/explore-scene-architecture.spec.ts --project=chromium --workers=1
pnpm exec playwright test --project=chromium --workers=2
```

`pnpm verify` runs formatting, ESLint, Next route type generation, TypeScript, Vitest and the runtime texture audit. It does **not** run the production build; `pnpm build` is a separate required step, as it is in CI.

## Gate 3B automated acceptance

- Rotation registry matches the moon/dwarf catalogues, including Nereid as fixed-unknown.
- Crossfade shells are not coplanar.
- The 48-body scale artifact is synchronized and has zero failed rows.
- Texture ceilings, hashes, provenance and representation labels are valid.
- Catalogue completeness, selection, camera focus, comet tails, rings, stable orbit objects and deterministic A → B → A rotation pass.
- Full Playwright result has zero failed, flaky and skipped tests.

## Manual GPU acceptance

Run at 1440×900 on a hardware-accelerated Chromium session. Review every catalogue page for texture seams, repeated procedural language, silhouette identity and label framing. During texture load/crossfade, rotate and zoom the camera and reject shimmer, moiré or flashing pixels. Check representative parent systems in both Explore and Scientific modes for body/orbit ratio, clipping and camera focus.

A headless screenshot is evidence, not sufficient proof of driver-independent transparency and depth behavior.

## Official asset import verification

After running `pnpm assets:celestial:official`, inspect `test-artifacts/gate3b-official-asset-import.json`, rerun `pnpm verify` and `pnpm build`, then review every imported body in the test-only GPU catalogue. A successful download does not waive seam, pole, landmark or crossfade review.
