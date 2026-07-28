# External Data Acceptance

## Contract

Every external provider is represented in `provider-contracts.ts` with:

- official origin and documentation URL;
- authentication mode;
- freshness classification;
- request timeout and cache/revalidation period;
- expected API version where the provider publishes one;
- verified snapshot or static-catalogue fallback;
- an explanatory limitation shown by the product surface.

The UI receives only validated, normalised domain models. Observation time and retrieval time remain separate.

## Provider matrix

| Provider     | Runtime mode             | Freshness        |  Cache | Fallback          | Release note                                          |
| ------------ | ------------------------ | ---------------- | -----: | ----------------- | ----------------------------------------------------- |
| APOD         | NASA API key             | latest available |   24 h | verified snapshot | Media date and media type stay visible.               |
| DONKI        | NASA API key             | latest available | 30 min | verified snapshot | Event families may return partially.                  |
| NeoWs        | NASA API key             | latest available |    3 h | verified snapshot | Hazard classification is not an impact prediction.    |
| EPIC         | public JSON              | latest available |    3 h | verified snapshot | Capture time is shown.                                |
| EONET v3     | public JSON              | near-live        | 30 min | verified snapshot | Not an emergency-warning service.                     |
| GIBS         | public WMTS              | latest available |   24 h | static catalogue  | Layer date and colour treatment remain visible.       |
| NASA Images  | public JSON              | latest available |   72 h | verified snapshot | Results are normalised and limited.                   |
| JPL CAD      | public JSON, version 1.5 | latest available |    3 h | verified snapshot | A version mismatch rejects the response.              |
| JPL Fireball | public JSON, version 1.2 | historical       |   24 h | verified snapshot | Radiated and estimated impact energy remain separate. |
| Mars Trek    | official external link   | reference        |    n/a | static catalogue  | No embedded telemetry claim.                          |
| Mercury Trek | official external link   | reference        |    n/a | static catalogue  | Reference link only.                                  |
| InSight      | bundled dated snapshot   | historical       |    n/a | verified snapshot | No retired weather endpoint is called at runtime.     |

## Verification commands

Static contract and source checks:

```bash
pnpm audit:providers
pnpm audit:sources
```

Live provider probe in a network-enabled release environment:

```bash
NASA_API_KEY=... pnpm probe:providers:release
```

The release probe fails when a required key is missing, an endpoint is unreachable, a response shape is invalid or a pinned JPL version changes. It prints status only and never prints the key.

## Failure behavior

- `401`/`403`: configuration or authorization state; no client key exposure.
- `429`: rate-limit state; cached/snapshot content may remain visible with status.
- timeout/network/upstream failure: verified fallback or unavailable state.
- malformed JSON/schema/version mismatch: response rejected before the UI.
- empty provider result: a designed empty state, not fabricated content.
- InSight: always a dated historical landing-site observation, never “Mars today”.
