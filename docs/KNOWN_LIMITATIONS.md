# Known Limitations

## Scientific and visual scope

- Explore is an explanatory two-body/ephemeris experience, not a navigation or mission-planning tool.
- Galactic Context is a separate schematic map and not a physically continuous Solar System-to-galaxy zoom.
- Belt, cloud and heliosphere visuals represent regions and boundaries; they do not enumerate every member or measured plasma structure.
- Several secondary-body surfaces remain documented reference-guided visual reconstructions until compatible source-derived global products are imported and orientation-verified.
- Exact N-body perturbations, relativistic corrections and complete mission trajectories are outside the release scope.

## External data

- APOD, DONKI and NeoWs need a server-only `NASA_API_KEY` for current provider responses.
- Remote services can be stale, partial or unavailable; Helios keeps verified snapshots/static explanations rather than inventing current records.
- InSight is a bundled historical landing-site snapshot. Helios does not depend on a current InSight weather API.
- Trek products open the official external map; Helios does not proxy or embed the full application.

## Device-dependent acceptance

The following cannot be proven by source inspection and require the release browser/device matrix:

- driver-dependent transparency, depth and bloom behavior;
- Galactic Context composition and Sun prominence/corona blending;
- mobile touch, pinch and camera feel;
- Safari/WebKit rendering differences;
- actual frame pacing, GPU memory, bundle transfer and resource disposal.

These are release acceptance items, not hidden implementation claims.
