# Release Evidence — 1.0.0

Recorded on 2026-10-20 against commit `1ec08e7` (production build, Node 22.23.3, pnpm 10.34.4). Raw reports sit next to this file. A blank or "untested" entry means no evidence was collected; it is not a pass.

## Production performance (`pnpm audit:performance`)

Two runs of the same measurement: the unmodified script (headless Chromium 149, SwiftShader software GL) and the same measurement in headed Chromium 149 on hardware GPU (`ANGLE (Intel, Mesa Intel Iris Xe Graphics (ADL GT2), OpenGL ES 3.2)`, Linux 7.2). Viewport 1440×1000.

| Metric                                      | SwiftShader | Hardware GPU |
| ------------------------------------------- | ----------- | ------------ |
| Root JS (brotli)                            | 137.5 KiB   | 137.5 KiB    |
| Explore 3D chunks (brotli)                  | 246.6 KiB   | 246.6 KiB    |
| Home script transfer                        | 265 KiB     | 265 KiB      |
| Explore 3D chunk loaded on Home             | No          | No           |
| Explore textures requested / duplicates     | 60 / 0      | 60 / 0       |
| Explore texture transfer                    | 4.19 MiB    | 4.19 MiB     |
| Saturn-selected frame pacing, average       | 9.5 fps     | 144 fps      |
| p50 / p95 frame time                        | 83 / 217 ms | 6.9 / 7.0 ms |
| Frames over 33 ms (4 s sample)              | 36 of 38    | 0 of 577     |
| Long tasks                                  | 0           | 0            |
| JS heap with Saturn selected                | 19.0 MiB    | 19.1 MiB     |
| Console/page errors (Explore and lifecycle) | 0           | 0            |

SwiftShader frame pacing reflects CPU rasterisation, not a target device; use the hardware column for frame pacing.

### Route-exit disposal (Home → Explore → Home, three visits)

| Visit | Canvases in Explore | Canvases after exit | Heap after exit | DOM nodes after exit | Listeners after exit |
| ----- | ------------------- | ------------------- | --------------- | -------------------- | -------------------- |
| 0     | —                   | 0                   | 4.7 MiB         | 340                  | 322                  |
| 1     | 1                   | 0                   | 14.2 MiB        | 440                  | 390                  |
| 2     | 1                   | 0                   | 14.6 MiB        | 543                  | 402                  |
| 3     | 1                   | 0                   | 15.0 MiB        | 646                  | 414                  |

(Hardware GPU run.) The canvas is released on every exit and Explore never holds more than one. Each visit still leaves about 0.4 MiB heap, about 100 DOM nodes and 12 listeners behind on Home. Three visits are not enough to tell retained router/page cache from a leak; repeat with more visits before calling it either.

## NASA/JPL providers

- `pnpm probe:providers` (no key), 2026-10-20 17:36 UTC: APOD, DONKI, EPIC, EONET, NASA Images, CNEOS CAD 1.5, CNEOS Fireball 1.2, GIBS, Mars Trek and Mercury Trek returned 200 and passed schema checks. NeoWs was skipped (no key). InSight is a bundled historical snapshot by design.
- `pnpm probe:providers:release` with the production key: **not run**. The key exists only in Vercel, so the release probe was not run.
- Production `/data` on heliios.vercel.app, 2026-10-20 17:45 UTC: after ISR revalidation, NeoWs and CNEOS CAD were `latest-available`, DONKI and EONET `near-live`, APOD/EPIC/GIBS `latest-available`, InSight and Fireball `historical`. So the production key works through the deployed server. The first request after an idle period served the previous cached page, correctly labelled `stale`/`fallback`, before revalidating.
- `/api/health` returned `{"status":"ok"}`.

## Hardware scene check

Done in the hardware GPU run above (headed Chromium, Intel Iris Xe):

- Explore opened on the automatic High visual contract with no console errors.
- Overview: Sun label, orbits, belt, ring and comet markers rendered (screenshot reviewed).
- Saturn selection: camera framed Saturn with rings and moons; label and selection panel matched.
- Route exit released the canvas on all three visits (table above).

Not covered: Galactic Context, solar prominence/corona close-up, Scientific scale profile, texture seams and night-side city lights were not reviewed by hand. The discrete NVIDIA GPU, Firefox, Edge and Safari on hardware were not tested.

## Devices

| Platform                             | Status                                 |
| ------------------------------------ | -------------------------------------- |
| Chrome/Chromium desktop, Linux, iGPU | Checked (above)                        |
| Firefox desktop, hardware GPU        | Untested                               |
| Edge desktop, hardware GPU           | Untested                               |
| Safari on Apple hardware             | Untested — no Apple hardware available |
| iOS Safari, physical iPhone/iPad     | Untested — no device available         |
| Android Chrome, physical device      | Untested — no device available         |

Emulated Android Chrome and iOS Safari projects pass in CI. They emulate the engine and viewport only; they are not physical devices.
