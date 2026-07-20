# Background secondary-asset scheduler result

## Contract

- The opening gate remains Sun → eight planets → primary Earth/Saturn layers.
- Prompt 3 assets are registered as secondary work and never join the blocking loader.
- Priority order is selected body, opened parent system, active category, then baseline profile priority.
- Residency is bounded to 12 secondary leases.
- One failed asset remains object-local and does not cancel sibling loads.
- `useSceneTexture` retains a ref-counted lease, delays disposal for transition reuse and releases old resources after a successful replacement.
- Fallback → final material transition is reduced-motion aware.

## Verification

The scheduler data test covers selection, parent-system and category promotion plus bounded residency. The loader-lifecycle integration test covers non-blocking startup, local failure, final material replacement and release/disposal. Runtime browser execution was not available in this environment because dependency installation was blocked by DNS; the tests are included for the final Chromium gate.
