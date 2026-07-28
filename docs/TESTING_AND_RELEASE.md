# Testing and Release

## Required native command order

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm build
pnpm exec playwright test --project=chromium --workers=2
pnpm audit:performance
NASA_API_KEY=... pnpm probe:providers:release
```

`pnpm verify:static` runs every browser/native-independent source and contract check. `pnpm verify` adds Next route type generation and Vitest. Production build, browser E2E, performance measurement and live provider connectivity remain explicit separate release checks.

## Static and server-render audits

- `audit:routes`: 57 body, four region, legacy canonical metadata, sitemap and robots.
- `audit:scene`: Galactic Context, Sun prominence and all extended-body focus-distance contracts in Exploration and Scientific profiles.
- `audit:boundaries`: Home/Missions cannot reach the WebGL dependency graph.
- `audit:i18n`: EN/TR catalogue shape, server locale routes and cookie refresh.
- `audit:providers`: provider auth/cache/timeout/version/fallback rules.
- `audit:sources`: source registry uniqueness, HTTPS and paired notes.
- `audit:budgets`: scene, texture, scope, sitemap and provider static limits.
- `audit:editorial`: both locales across 126 server-rendered editorial/detail surfaces, Home SVG orbit geometry, ambient-edge layering, Sun portrait glow and Saturn page-ring treatment.
- `audit:interactions`: browser-independent focus transfer, locale switch, live-region and invalid-form feedback contracts.
- `audit:textures`: runtime file ownership, dimensions, hashes, provenance and orientation metadata.

## Native unit/component acceptance

- No TypeScript, lint or React warning output.
- Calculation, schema, adapter, fallback, persistence and scene-contract tests pass. Camera policy covers every extended body in both scale profiles and keeps tiny Scientific targets within a useful finite framing range.
- Unknown body/region/legacy routes produce 404.
- Compare rejects non-finite/extreme input and preserves a shareable URL.
- Locale survives refresh without changing scientific state.
- Provider errors cover unauthorized, forbidden, rate limit, timeout, upstream, malformed JSON, schema, empty and version mismatch.

## Browser acceptance

- All 61 semantic destinations return 200 with the expected heading.
- Home, Explore, Compare, Missions, Data, About, Case Study and eight planets pass desktop/mobile/200%-zoom flows.
- Current, stale, fallback, partial, empty and unavailable remote states remain designed and labelled.
- Keyboard selection transfers focus to the new summary, Escape restores the initiating control, and locale changes preserve the language-button focus.
- Tempel 1 and representative planet/moon/region targets settle on the correct scene target after switching between Exploration and Scientific profiles; the scale switch must recompute framing rather than reuse the prior distance. Tiny Scientific targets must use scale-aware settle tolerances and end at the exact target pose.
- Touch, reduced motion and WebGL fallback work.
- Full Playwright has zero failed, flaky, skipped or unexpectedly retried tests.

## Manual GPU acceptance

Review Galactic Context, solar prominence/corona, texture seams/orientation, city-light rejection, rings, comet tails, labels, loading crossfades, editorial page texture/background composition, camera framing in both profiles and route-exit disposal on hardware-accelerated desktop and mobile-class devices. Headless screenshots are evidence, not proof of driver-independent transparency/depth behavior.

## Release evidence

Preserve:

- native command results;
- browser-suite summary;
- provider probe report;
- production performance report;
- manual GPU/device checklist;
- current route/sitemap and source/licence audits;
- screenshots, demo video and known limitations.

Use `RELEASE_CHECKLIST.md` for the final sign-off.

- Camera framing audits cover 61 selectable targets across two scale profiles and desktop/mobile aspect ratios (244 contracts).
- Editorial CSS audits protect skip-link flow, WebKit masks, compositor-oriented portrait motion, Sun-specific glow and Saturn ring presentation.
