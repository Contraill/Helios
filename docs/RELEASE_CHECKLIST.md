# Release Checklist

## Source and product contract

- [x] 57 canonical body routes and four region routes.
- [x] Eight custom planet compositions and Missions index.
- [x] Compare, Data, About and Case Study final content systems.
- [x] Complete EN/TR visible copy, accessibility labels, metadata and data states.
- [x] Canonical metadata, sitemap, robots and social images.
- [x] Provider contracts, version checks, timeouts, cache and fallbacks.
- [x] Static scene, texture, source, language, route and budget audits.
- [x] All 61 selectable targets have finite camera framing contracts in Exploration and Scientific profiles at desktop and mobile aspect ratios (244 contracts).
- [x] Editorial body, planet and comparison portraits reuse attributed local texture assets behind a low-cost ambient page backdrop; texture motion is compositor-oriented and Saturn’s page rings use an elliptical band treatment.
- [x] Home orbit markers are geometrically bound to SVG ellipses, and the ambient background cannot paint a one-pixel strip at the viewport edge.
- [x] Active architecture, data, performance, language and limitation documents.

## Native automated acceptance

Run on a clean Node 22 / pnpm 10.34.4 environment:

```bash
pnpm install --frozen-lockfile
pnpm verify:static
pnpm audit:interactions
pnpm verify
pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm exec playwright install chrome
pnpm exec playwright install msedge
pnpm test:e2e:release
pnpm audit:performance
NASA_API_KEY=... pnpm probe:providers:release
```

- [ ] Native checks and production build pass without errors.
- [ ] Full Chromium Playwright suite passes with zero failed, flaky, skipped or unexpectedly retried tests.
- [ ] Desktop Chrome release suite passes.
- [ ] Desktop Firefox release suite passes.
- [ ] Desktop WebKit/Safari-proxy release suite passes.
- [ ] Desktop Microsoft Edge release suite passes.
- [ ] Android Chrome emulation release suite passes.
- [ ] iOS Safari emulation release suite passes.
- [ ] No configured browser project reports zero tests.
- [ ] Production provider probe is preserved with release evidence.
- [ ] Production performance report is preserved with release evidence.

## Manual browser and GPU acceptance

Automated engine/device coverage does not replace real hardware checks.

- [ ] Current Chrome, Firefox and Edge on a hardware-accelerated desktop.
- [ ] Current Safari on Apple hardware where available.
- [ ] iOS Safari on a physical iPhone/iPad where available.
- [ ] Android Chrome on a physical Android device where available.
- [ ] Keyboard-only, reduced motion, 200% zoom and screen-reader smoke flow.
- [ ] WebGL unavailable fallback and manual retry.
- [ ] WebGL context loss/recovery on at least one hardware-accelerated desktop browser.
- [ ] Galactic Context transition and marker legibility.
- [ ] Sun prominence contact, flow, corona and transparency.
- [ ] Planet textures, rings, city lights, comet tails and labels.
- [ ] Tempel 1 and representative star/planet/moon/region targets settle at readable angles in both scale profiles.
- [ ] Editorial texture cropping, contrast and background density remain balanced on desktop, mobile and reduced motion.
- [ ] Touch, pinch, drag, scroll and panel interaction.

## Deployment

- [ ] Set `NASA_API_KEY` and canonical `SITE_URL` in production.
- [ ] Verify `/sitemap.xml`, `/robots.txt`, canonical and social tags on the production domain.
- [ ] Confirm API keys are absent from client bundles and logs.
- [ ] Capture desktop/mobile screenshots and demo video.
- [ ] Add measured performance results and final known limitations to the case study.
- [ ] Review source/licence evidence.
- [ ] Create final version/tag and release notes only after approval.
