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

APOD moved from `api.nasa.gov/planetary/apod` to `science.nasa.gov/wp-json/wp/v2/apod-basic` (dates as `YYMMDD`, HTML fields reduced to plain text, images requested at 1280 px). DONKI moved from `api.nasa.gov/DONKI` to `ccmc.gsfc.nasa.gov/DONKI-API/get/*` in September 2026; Kp values now arrive in `allKpIndex`. Neither needs `NASA_API_KEY`. A runtime fallback to a snapshot is logged on the server with the provider and error kind.

| Provider     | Runtime mode             | Freshness        |  Cache | Fallback          | Release note                                          |
| ------------ | ------------------------ | ---------------- | -----: | ----------------- | ----------------------------------------------------- |
| APOD         | public JSON (WordPress)  | latest available |   24 h | verified snapshot | Media date and media type stay visible.               |
| DONKI        | public JSON (CCMC)       | latest available | 30 min | verified snapshot | Event families may return partially.                  |
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
