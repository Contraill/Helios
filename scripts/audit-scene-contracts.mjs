import path from "node:path";

import { createJiti } from "jiti";

const ROOT = process.cwd();
const jiti = createJiti(path.join(ROOT, "scripts/scene-audit-runner.cjs"), {
  interopDefault: true,
  alias: { "@": path.join(ROOT, "src") },
});

const { sceneProfileFor } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/scene-profiles.ts"),
);
const { cameraFocusPolicy } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/camera-focus-policy.ts"),
);
const { cameraPoseHasSettled, cameraSettlementTolerance } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/camera-poses.ts"),
);
const { CELESTIAL_SCALE_AUDIT } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/celestial-scale-audit.ts"),
);
const { createScenePlanets, sceneScaleFor } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/scene-planets.ts"),
);
const { createSceneSun } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/scene-sun.ts"),
);
const { planetaryRingOuterRadius } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/planetary-rings.ts"),
);
const { regionVisualProfileFor } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/region-visual-policy.ts"),
);
const { planets } = jiti(path.join(ROOT, "src/content/planets/index.ts"));
const { sun } = jiti(path.join(ROOT, "src/content/solar-system/sun.ts"));
const { isDwarfSystemParentId, SYSTEM_REGION_IDS } = jiti(
  path.join(ROOT, "src/features/solar-system/types/celestial-body.ts"),
);
const {
  createDeepFieldParticleData,
  createMilkyWayParticleData,
  galacticContextPhase,
  universeLayerOpacities,
} = jiti(path.join(ROOT, "src/features/solar-system/lib/universe-backdrop.ts"));
const { createSolarProminenceCurve, solarProminenceEnvelope } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/solar-prominence.ts"),
);

function fail(message) {
  throw new Error(message);
}

function assertFiniteArray(name, values, expectedLength) {
  if (values.length !== expectedLength) {
    fail(
      `${name}: expected ${expectedLength} values, received ${values.length}`,
    );
  }
  for (const value of values) {
    if (!Number.isFinite(value)) fail(`${name}: contains a non-finite value`);
  }
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

const profileResults = [];
for (const mode of ["exploration", "scientific"]) {
  const profile = sceneProfileFor(mode);
  const [starStart, starEnd] = profile.backdrop.localStarsFadeOut;
  const [galaxyStart, galaxyEnd] = profile.backdrop.milkyWayFadeIn;
  if (!(starStart < starEnd && galaxyStart < galaxyEnd)) {
    fail(`${mode}: backdrop thresholds are not strictly increasing`);
  }

  const samples = [
    0,
    Math.min(starStart, galaxyStart),
    (Math.max(starStart, galaxyStart) + Math.min(starEnd, galaxyEnd)) / 2,
    Math.max(starEnd, galaxyEnd),
    Math.max(starEnd, galaxyEnd) * 1.25,
  ];
  let previousStars = 1;
  let previousGalaxy = 0;
  for (const distance of samples) {
    const opacity = universeLayerOpacities(distance, profile);
    if (
      opacity.localStars < -1e-6 ||
      opacity.localStars > 1 + 1e-6 ||
      opacity.milkyWay < -1e-6 ||
      opacity.milkyWay > 1 + 1e-6
    ) {
      fail(`${mode}: opacity escaped the 0–1 range at ${distance}`);
    }
    if (opacity.localStars > previousStars + 1e-6) {
      fail(`${mode}: local stars become more visible while zooming out`);
    }
    if (opacity.milkyWay < previousGalaxy - 1e-6) {
      fail(`${mode}: galactic map becomes less visible while zooming out`);
    }
    previousStars = opacity.localStars;
    previousGalaxy = opacity.milkyWay;
  }

  if (galacticContextPhase(0, profile) !== "local") {
    fail(`${mode}: origin must remain in local context`);
  }
  if (galacticContextPhase(galaxyEnd * 1.25, profile) !== "galactic") {
    fail(`${mode}: far zoom never reaches galactic context`);
  }
  profileResults.push({ mode, galaxyEnd, starEnd });
}

for (const [name, factory, count] of [
  ["milky-way", createMilkyWayParticleData, 256],
  ["deep-field", createDeepFieldParticleData, 128],
]) {
  const first = factory(count);
  const second = factory(count);
  assertFiniteArray(`${name} positions`, first.positions, count * 3);
  assertFiniteArray(`${name} colors`, first.colors, count * 3);
  if (!arraysEqual(first.positions, second.positions)) {
    fail(`${name}: default seed is not deterministic`);
  }
  if (!arraysEqual(first.colors, second.colors)) {
    fail(`${name}: color generation is not deterministic`);
  }
}

for (const invalid of [-1, 0.5, Number.NaN]) {
  for (const factory of [
    createMilkyWayParticleData,
    createDeepFieldParticleData,
  ]) {
    let threw = false;
    try {
      factory(invalid);
    } catch {
      threw = true;
    }
    if (!threw) fail(`particle factory accepted invalid count ${invalid}`);
  }
}

const cameraResults = [];
const sceneSun = createSceneSun(sun);
const scenePlanets = createScenePlanets(planets);

const CAMERA_VIEWPORTS = [
  { id: "desktop", aspect: 16 / 9 },
  { id: "mobile", aspect: 9 / 16 },
];

function auditCameraTarget(mode, profile, metadata) {
  for (const viewport of CAMERA_VIEWPORTS) {
    const policy = cameraFocusPolicy({
      aspect: viewport.aspect,
      fovDegrees: 46,
      metadata,
      profile,
    });
    for (const [label, value] of Object.entries(policy)) {
      if (!Number.isFinite(value) || value <= 0) {
        fail(
          `${mode}:${viewport.id}:${metadata.bodyId}: invalid camera ${label} ${value}`,
        );
      }
    }
    if (policy.desiredDistance < policy.minimumDistance) {
      fail(
        `${mode}:${viewport.id}:${metadata.bodyId}: desired camera distance is below minimum`,
      );
    }
    if (policy.desiredDistance > policy.maximumDistance) {
      fail(
        `${mode}:${viewport.id}:${metadata.bodyId}: desired camera distance exceeds maximum`,
      );
    }
    cameraResults.push({
      bodyId: metadata.bodyId,
      desiredDistance: policy.desiredDistance,
      framingRadius: policy.framingRadius,
      mode,
      viewport: viewport.id,
    });
  }
}

for (const mode of ["exploration", "scientific"]) {
  const profile = sceneProfileFor(mode);
  const sunRadius = sceneSun.scales[mode];
  auditCameraTarget(mode, profile, {
    bodyId: "sun",
    targetKind: "body",
    renderRadius: sunRadius,
    collisionRadius: sunRadius,
    focusRadius: sunRadius * 1.08,
  });

  for (const planet of scenePlanets) {
    const scale = sceneScaleFor(planet, mode);
    auditCameraTarget(mode, profile, {
      bodyId: planet.id,
      targetKind: "body",
      renderRadius: scale.radius,
      collisionRadius: scale.radius,
      focusRadius: scale.radius * planetaryRingOuterRadius(planet.id),
    });
  }

  for (const body of CELESTIAL_SCALE_AUDIT.bodies) {
    const system = isDwarfSystemParentId(body.bodyId);
    auditCameraTarget(mode, profile, {
      bodyId: body.bodyId,
      targetKind: system ? "system" : "body",
      renderRadius: body.geometryBounds[mode],
      collisionRadius: body.geometryBounds[mode],
      focusRadius: body.focusRadius[mode],
      ...(system ? { systemExtent: body.systemExtent[mode] } : {}),
    });
  }

  for (const regionId of SYSTEM_REGION_IDS) {
    const region = regionVisualProfileFor(regionId, mode, profile);
    auditCameraTarget(mode, profile, {
      bodyId: regionId,
      targetKind: "region",
      renderRadius: region.camera.framingExtent,
      collisionRadius: region.collisionRadius,
      focusRadius: region.camera.framingExtent,
      systemExtent: region.camera.framingExtent,
      regionPresentation: region.camera,
    });
  }
}

const tempelExploration = cameraResults.find(
  (entry) =>
    entry.bodyId === "tempel-1" &&
    entry.mode === "exploration" &&
    entry.viewport === "desktop",
);
const tempelScientific = cameraResults.find(
  (entry) =>
    entry.bodyId === "tempel-1" &&
    entry.mode === "scientific" &&
    entry.viewport === "desktop",
);
if (
  !tempelExploration ||
  !tempelScientific ||
  tempelScientific.desiredDistance >= tempelExploration.desiredDistance ||
  tempelScientific.desiredDistance >= 0.00001
) {
  fail("Tempel 1 does not receive a useful distinct Scientific focus distance");
}
const tempelTolerance = cameraSettlementTolerance(
  tempelScientific.desiredDistance,
  tempelScientific.framingRadius,
);
if (
  cameraPoseHasSettled(
    0.16,
    0.09,
    tempelTolerance.position,
    tempelTolerance.target,
  )
) {
  fail("Tempel 1 can settle while still far outside its Scientific frame");
}

const envelopeSamples = Array.from({ length: 241 }, (_, index) =>
  solarProminenceEnvelope(index / 24, 0.17, 10),
);
if (envelopeSamples.some((value) => value < 0 || value > 1)) {
  fail("solar prominence envelope escaped the 0–1 range");
}
if (Math.max(...envelopeSamples) < 0.98) {
  fail("solar prominence envelope never reaches a fully visible state");
}
if (Math.min(...envelopeSamples) > 0.02) {
  fail("solar prominence envelope never reaches its dark interval");
}

const anchorRadius = 0.995;
const lift = 0.22;
const curve = createSolarProminenceCurve({
  anchorRadius,
  lift,
  spanRadians: 0.82,
});
const startRadius = curve.getPoint(0).length();
const endRadius = curve.getPoint(1).length();
const apexRadius = curve.getPoint(0.5).length();
if (Math.abs(startRadius - anchorRadius) > 1e-6) {
  fail("solar prominence start anchor is detached from the surface");
}
if (Math.abs(endRadius - anchorRadius) > 1e-6) {
  fail("solar prominence end anchor is detached from the surface");
}
if (Math.abs(apexRadius - (anchorRadius + lift)) > 1e-6) {
  fail("solar prominence apex does not match the requested lift");
}

process.stdout.write(
  `${JSON.stringify(
    {
      auditedAt: new Date().toISOString(),
      errors: [],
      galacticProfiles: profileResults,
      particleContracts: 2,
      cameraFocusContracts: cameraResults.length,
      prominenceSamples: envelopeSamples.length,
    },
    null,
    2,
  )}\n`,
);
