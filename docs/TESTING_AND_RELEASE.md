# Testing and Release

## Required native command order

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm exec playwright install chrome
pnpm exec playwright install msedge
pnpm test:e2e:release
pnpm audit:performance
NASA_API_KEY=... pnpm probe:providers:release
```

`pnpm verify:static` runs every browser/native-independent source and contract check. `pnpm verify` adds Next route type generation and Vitest. Production build, browser E2E, performance measurement and live provider connectivity remain explicit separate release checks.

`pnpm test:e2e:release` is the automated browser release gate. It runs the full Chromium suite first, then the dedicated cross-browser release suites for desktop Chrome, Firefox, WebKit/Safari, Microsoft Edge, Android Chrome emulation and iOS Safari emulation. The cross-browser projects use explicit release-spec files rather than an empty tag filter, so a configured browser project cannot silently pass with zero tests.

## Static and server-render audits

- `audit:routes`: 57 body, four region, legacy canonical metadata, sitemap and robots.
- `audit:scene`: Galactic Context, Sun prominence and all extended-body focus-distance contracts in Exploration and Scientific profiles.
- `audit:boundaries`: Home/Missions cannot reach the WebGL dependency graph.
- `audit:i18n`: EN/TR catalogue shape, server locale routes and the locale URL contract.
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

### Full Chromium suite

The `chromium` project remains the exhaustive browser integration suite. It covers the complete route, scene, renderer, mobile, accessibility, data, 404 and lifecycle contracts. The cross-browser release-spec files are excluded from this project because equivalent Chromium coverage already exists in the full suite.

### Desktop cross-browser release suite

The same dedicated desktop release suite runs against:

- current Google Chrome channel;
- current Firefox engine;
- Playwright WebKit as the automated Safari engine proxy;
- current Microsoft Edge channel.

The suite verifies representative public route families, runtime error absence, document overflow, semantic 404 recovery, Signal Breaker startup, EN/TR persistence, Mars calculations, Compare URL/history/validation, APOD fallback provenance, Explore scene-or-fallback behavior, keyboard focus restoration, reduced motion, initial WebGL recovery, skip-link order and representative WCAG A/AA scans.

### Mobile browser release suite

The same dedicated mobile release suite runs against:

- Android Chrome emulation using Chromium and a Pixel-class device profile;
- iOS Safari emulation using WebKit and an iPhone-class device profile.

The suite verifies route-family width safety, home/APOD stacking and touch-target size, footer policy, one-viewport 404 behavior, touch-playable Signal Breaker, mobile Explore dialog/fallback behavior, calculator and Compare usability, language persistence, reduced motion and representative WCAG A/AA scans.

### Required acceptance result

- All 61 semantic destinations return 200 with the expected heading in the exhaustive Chromium coverage.
- Home, Explore, Compare, Missions, Data, About, Case Study and eight planets pass desktop/mobile/200%-zoom flows.
- Current, stale, fallback, partial, empty and unavailable remote states remain designed and labelled.
- Keyboard selection transfers focus to the new summary, Escape restores the initiating control, and locale changes preserve the language-button focus.
- Tempel 1 and representative planet/moon/region targets settle on the correct scene target after switching between Exploration and Scientific profiles; the scale switch must recompute framing rather than reuse the prior distance. Tiny Scientific targets must use scale-aware settle tolerances and end at the exact target pose.
- Touch, reduced motion and WebGL fallback/recovery work.
- Full Chromium and every cross-browser release project have zero failed, flaky, skipped or unexpectedly retried tests.
- A cross-browser project reporting zero tests is a release failure, not an acceptable result.

## Manual GPU and device acceptance

Automated WebKit and mobile device profiles are browser-engine/device emulation, not substitutes for hardware Safari or a physical phone. Before final release, review Galactic Context, solar prominence/corona, texture seams/orientation, city-light rejection, rings, comet tails, labels, loading crossfades, editorial page texture/background composition, camera framing in both profiles and route-exit disposal on hardware-accelerated desktop and mobile-class devices.

At minimum, manually confirm current Safari on Apple hardware, iOS Safari on a physical iPhone/iPad where available, Android Chrome on a physical Android device where available, and Edge/Chrome/Firefox on a hardware-accelerated desktop. Headless screenshots are evidence, not proof of driver-independent transparency/depth behavior.

## CI browser gate

GitHub Actions runs three acceptance layers:

1. native checks, typecheck, unit tests and production build;
2. exhaustive Chromium Playwright coverage;
3. a fail-fast-disabled cross-browser matrix so Chrome, Firefox, WebKit, Edge, Android Chrome emulation and iOS Safari emulation all report independently.

A failure in any matrix entry keeps the workflow red. Failed browser jobs upload their Playwright HTML report as a separate artifact.

## Release evidence

Preserve:

- native command results;
- full Chromium suite summary;
- every cross-browser project summary;
- failed-run Playwright artifacts when diagnosing release blockers;
- provider probe report;
- production performance report;
- manual GPU/device checklist;
- current route/sitemap and source/licence audits;
- screenshots, demo video and known limitations.

- Camera framing audits cover 61 selectable targets across two scale profiles and desktop/mobile aspect ratios (244 contracts).
- Editorial CSS audits protect skip-link flow, WebKit masks, compositor-oriented portrait motion, Sun-specific glow and Saturn ring presentation.
