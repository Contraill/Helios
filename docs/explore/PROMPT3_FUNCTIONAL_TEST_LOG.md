# Prompt 3 functional test log

## Completed in this environment

- External artifact SHA-256 verification: PASS.
- Bundle `git fsck --full --strict`: PASS (non-fatal dangling-object notice only).
- Exact commit/tree verification: PASS.
- Prompt 2 internal `SHA256SUMS.txt`: PASS.
- Prompt 2 preflight and 169-operation apply: PASS.
- TypeScript/TSX syntax transpilation for changed Prompt 3 modules: PASS.
- `git diff --check`: PASS.
- Runtime texture/asset audit: PASS, zero errors and zero warnings.
- Deterministic evidence render: PASS, 22 required evidence images.

## Test coverage added

- Combined manifest/asset audit.
- Visual registry coverage and representative identity test.
- Background scheduler and lease lifecycle tests.
- Dwarf-satellite catalogue/source/representation test.
- Navigator parent-system drill-down test.
- Acceptance-only catalogue smoke and object-local failure E2E.
- Existing scientific continuity and anti-solar tail Chromium flows retained.

## Environment-limited commands

`pnpm install --frozen-lockfile` could not resolve `registry.npmjs.org` (`EAI_AGAIN`). Therefore Prettier, ESLint, Next type generation, Vitest, production build and Playwright Chromium execution could not be truthfully run here. Firefox/WebKit were also unavailable. These are recorded as user-side/final-CI checks rather than silently marked passed.
