import type { SceneProfile } from "@/features/solar-system/lib/scene-profiles";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

export type RegionId =
  "asteroid-belt" | "kuiper-belt" | "oort-cloud" | "heliosphere";

export type RegionVisualKind =
  "main-belt" | "trans-neptunian-belt" | "distant-shell" | "solar-boundary";

export type RegionVisualState = "ambient" | "hovered" | "selected";
export type RegionRepresentation = "context-layer" | "inferred" | "schematic";

export interface RegionFocusAnchor {
  readonly radialFraction: number;
  readonly azimuthDeg: number;
  readonly heightFraction: number;
}

export interface RegionCameraPresentation {
  readonly framingExtent: number;
  readonly preferredDirection: readonly [number, number, number];
  readonly focusAnchor: RegionFocusAnchor;
  readonly minimumViewportCoverage: number;
  readonly maximumViewportCoverage: number;
}

export interface RegionMacroEnvelopeProfile {
  readonly kind: "annular-ribbon" | "volumetric-belt" | "distant-shell";
  readonly color: string;
  readonly layerCount: number;
  readonly radialExtent: readonly [number, number];
  readonly verticalExtent: number;
  readonly ambientOpacity: number;
  readonly hoveredOpacity: number;
  readonly selectedOpacity: number;
  readonly coverageExtent: number;
}

export interface RegionVisualProfile {
  readonly bodyId: RegionId;
  readonly kind: RegionVisualKind;
  readonly representation: RegionRepresentation;
  readonly distribution: {
    readonly pointCount: number;
    readonly radialExtent: readonly [number, number];
    readonly verticalExtent: number;
    readonly inclinationRangeDeg: readonly [number, number];
    readonly opacity: number;
    readonly hoveredOpacity: number;
    readonly selectedOpacity: number;
    readonly pointSize: number;
    readonly selectedPointSize: number;
  };
  readonly camera: RegionCameraPresentation;
  readonly macroEnvelope?: RegionMacroEnvelopeProfile;
  readonly collisionRadius: number;
  readonly drawCalls: number;
  readonly materialCount: number;
}

export interface RegionParticleStratum {
  readonly id: string;
  readonly color: string;
  readonly opacityMultiplier: number;
  readonly pointSizeMultiplier: number;
  readonly positions: Float32Array;
  readonly population: string;
}

export interface RegionDistribution {
  readonly bodyId: RegionId;
  readonly kind: RegionVisualKind;
  readonly pointCount: number;
  readonly radialExtent: readonly [number, number];
  readonly verticalExtent: number;
  readonly signature: string;
  readonly strata: readonly RegionParticleStratum[];
}

const TAU = Math.PI * 2;

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normaliseDirection(
  direction: readonly [number, number, number],
): readonly [number, number, number] {
  const length = Math.hypot(direction[0], direction[1], direction[2]);
  if (!Number.isFinite(length) || length < 1e-8) return [1, 0.55, 1];
  return [direction[0] / length, direction[1] / length, direction[2] / length];
}

function sceneDistance(profile: SceneProfile, au: number): number {
  return finitePositive(profile.scale.strategy.distanceFromAu(au), 0.01);
}

export function regionVisualProfileFor(
  bodyId: RegionId,
  mode: ScaleMode,
  profile: SceneProfile,
): RegionVisualProfile {
  const scientific = mode === "scientific";
  if (bodyId === "asteroid-belt") {
    const inner = sceneDistance(profile, 2.05);
    const outer = sceneDistance(profile, 3.35);
    const extent = Math.max(inner, outer);
    return {
      bodyId,
      kind: "main-belt",
      representation: "context-layer",
      distribution: {
        pointCount: 1_050,
        radialExtent: [inner, outer],
        verticalExtent: Math.max(0.18, extent * (scientific ? 0.018 : 0.055)),
        inclinationRangeDeg: [0.2, scientific ? 19 : 24],
        opacity: 0.56,
        hoveredOpacity: 0.66,
        selectedOpacity: 0.72,
        pointSize: scientific ? 0.055 : 0.072,
        selectedPointSize: scientific ? 0.075 : 0.098,
      },
      camera: {
        framingExtent: extent * 0.72,
        preferredDirection: normaliseDirection([1.12, 0.68, 0.92]),
        focusAnchor: {
          radialFraction: 0.82,
          azimuthDeg: -32,
          heightFraction: 0.035,
        },
        minimumViewportCoverage: 0.2,
        maximumViewportCoverage: 0.86,
      },
      macroEnvelope: {
        kind: "annular-ribbon",
        color: "#9f896f",
        layerCount: 3,
        radialExtent: [inner, outer],
        verticalExtent: Math.max(0.12, extent * 0.028),
        ambientOpacity: 0.13,
        hoveredOpacity: 0.15,
        selectedOpacity: 0.17,
        coverageExtent: outer,
      },
      collisionRadius: Math.max(0.02, extent * 0.08),
      drawCalls: 6,
      materialCount: 6,
    };
  }

  if (bodyId === "kuiper-belt") {
    const inner = sceneDistance(profile, 30);
    const outer = sceneDistance(profile, 72);
    const extent = Math.max(inner, outer);
    return {
      bodyId,
      kind: "trans-neptunian-belt",
      representation: "context-layer",
      distribution: {
        pointCount: 820,
        radialExtent: [inner, outer],
        verticalExtent: Math.max(0.42, extent * (scientific ? 0.14 : 0.2)),
        inclinationRangeDeg: [1, scientific ? 36 : 42],
        opacity: 0.47,
        hoveredOpacity: 0.56,
        selectedOpacity: 0.61,
        pointSize: scientific ? 0.052 : 0.064,
        selectedPointSize: scientific ? 0.071 : 0.086,
      },
      camera: {
        framingExtent: extent * 0.78,
        preferredDirection: normaliseDirection([0.92, 0.98, 0.74]),
        focusAnchor: {
          radialFraction: 0.8,
          azimuthDeg: 24,
          heightFraction: 0.09,
        },
        minimumViewportCoverage: 0.2,
        maximumViewportCoverage: 0.86,
      },
      macroEnvelope: {
        kind: "volumetric-belt",
        color: "#708da3",
        layerCount: 4,
        radialExtent: [inner, outer],
        verticalExtent: Math.max(0.34, extent * 0.14),
        ambientOpacity: 0.1,
        hoveredOpacity: 0.115,
        selectedOpacity: 0.13,
        coverageExtent: outer,
      },
      collisionRadius: Math.max(0.03, extent * 0.065),
      drawCalls: 7,
      materialCount: 7,
    };
  }

  if (bodyId === "oort-cloud") {
    // Oort is an inferred schematic context layer, not a literal continuous-scale
    // shell. Keep its visual/camera extent inside the profile budget while the
    // copy and metadata preserve the 2,000–100,000 AU scientific context.
    const extent = finitePositive(profile.extended.oort.renderRadius, 1);
    const inner = extent * 0.18;
    const outer = extent;
    return {
      bodyId,
      kind: "distant-shell",
      representation: "inferred",
      distribution: {
        pointCount: 1_650,
        radialExtent: [inner, outer],
        verticalExtent: extent,
        inclinationRangeDeg: [0, 180],
        opacity: 0.07,
        hoveredOpacity: 0.18,
        selectedOpacity: 0.38,
        pointSize: profile.extended.oort.pointSize,
        selectedPointSize: profile.extended.oort.pointSize * 1.16,
      },
      camera: {
        framingExtent: extent,
        preferredDirection: normaliseDirection([1.1, 0.64, 1.2]),
        focusAnchor: {
          radialFraction: 0,
          azimuthDeg: 0,
          heightFraction: 0,
        },
        minimumViewportCoverage: 0.22,
        maximumViewportCoverage: 0.74,
      },
      macroEnvelope: {
        kind: "distant-shell",
        color: "#7897b5",
        layerCount: 2,
        radialExtent: [extent * 0.58, extent * 0.98],
        verticalExtent: extent,
        ambientOpacity: 0.004,
        hoveredOpacity: 0.018,
        selectedOpacity: 0.052,
        coverageExtent: extent,
      },
      collisionRadius: Math.max(0.1, extent * 0.7),
      drawCalls: 5,
      materialCount: 5,
    };
  }

  const termination = sceneDistance(profile, 84);
  const heliopause = sceneDistance(profile, 121);
  const extent = Math.max(termination, heliopause);
  return {
    bodyId,
    kind: "solar-boundary",
    representation: "schematic",
    distribution: {
      pointCount: 480,
      radialExtent: [termination, heliopause],
      verticalExtent: extent * 0.78,
      inclinationRangeDeg: [0, 180],
      opacity: 0.001,
      hoveredOpacity: 0.035,
      selectedOpacity: 0.38,
      pointSize: scientific ? 0.045 : 0.038,
      selectedPointSize: scientific ? 0.082 : 0.072,
    },
    camera: {
      framingExtent: extent * 1.16,
      preferredDirection: normaliseDirection([1.08, 0.48, 0.82]),
      focusAnchor: {
        radialFraction: 0,
        azimuthDeg: 0,
        heightFraction: 0,
      },
      minimumViewportCoverage: 0.28,
      maximumViewportCoverage: 0.82,
    },
    collisionRadius: Math.max(0.04, termination * 0.68),
    drawCalls: 6,
    materialCount: 6,
  };
}

function pushPosition(
  target: Float32Array,
  index: number,
  radius: number,
  anomaly: number,
  inclination: number,
  ascendingNode: number,
  eccentricity: number,
): void {
  const orbitRadius =
    (radius * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(anomaly));
  const orbitalX = orbitRadius * Math.cos(anomaly);
  const orbitalZ = orbitRadius * Math.sin(anomaly) * Math.cos(inclination);
  target[index * 3] =
    orbitalX * Math.cos(ascendingNode) + orbitalZ * Math.sin(ascendingNode);
  target[index * 3 + 1] =
    orbitRadius * Math.sin(anomaly) * Math.sin(inclination);
  target[index * 3 + 2] =
    -orbitalX * Math.sin(ascendingNode) + orbitalZ * Math.cos(ascendingNode);
}

function beltDistribution(
  profile: RegionVisualProfile,
  sceneProfile: SceneProfile,
): RegionDistribution {
  const asteroid = profile.bodyId === "asteroid-belt";
  const random = seededRandom(asteroid ? 0xa57e201 : 0x4b554950);
  const total = profile.distribution.pointCount;
  const counts = asteroid
    ? [Math.round(total * 0.6), Math.round(total * 0.88), total]
    : [Math.round(total * 0.56), Math.round(total * 0.81), total];
  const strataCounts = [
    counts[0],
    counts[1] - counts[0],
    counts[2] - counts[1],
  ];
  const colors = asteroid
    ? ["#b7a58d", "#8f8174", "#d0b690"]
    : ["#92aec4", "#6f89a1", "#b4c5d1"];
  const populations = asteroid
    ? ["core-belt", "inclined-belt", "bright-anchors"]
    : ["classical-belt", "resonant-population", "scattered-disk"];
  const strata = strataCounts.map((count, stratum) => {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      let semiMajorAxisAu: number;
      let eccentricity: number;
      let inclinationDeg: number;
      if (asteroid) {
        const candidate = 2.05 + random() * 1.3;
        const gaps = [2.5, 2.82, 2.95];
        const nearestGap = gaps.reduce(
          (nearest, gap) =>
            Math.abs(candidate - gap) < Math.abs(candidate - nearest)
              ? gap
              : nearest,
          gaps[0],
        );
        const gapDistance = Math.abs(candidate - nearestGap);
        semiMajorAxisAu =
          gapDistance < 0.045
            ? candidate + (candidate < nearestGap ? -0.05 : 0.05)
            : candidate;
        eccentricity = 0.015 + random() * (stratum === 1 ? 0.2 : 0.14);
        inclinationDeg =
          Math.pow(random(), stratum === 1 ? 1.25 : 2.5) *
          (stratum === 1 ? 24 : 14);
      } else if (stratum === 0) {
        semiMajorAxisAu = 39 + Math.pow(random(), 1.05) * 10;
        eccentricity = 0.01 + random() * 0.12;
        inclinationDeg = Math.pow(random(), 1.55) * 24;
      } else if (stratum === 1) {
        semiMajorAxisAu = 30 + random() * 13;
        eccentricity = 0.05 + random() * 0.2;
        inclinationDeg = Math.pow(random(), 1.25) * 32;
      } else {
        const outerBias = 1 - Math.pow(random(), 2.2);
        semiMajorAxisAu = 44 + outerBias * 31;
        eccentricity = 0.15 + random() * 0.34;
        inclinationDeg = 8 + Math.pow(random(), 0.9) * 38;
      }
      const sceneRadius = sceneDistance(sceneProfile, semiMajorAxisAu);
      const sign = random() < 0.5 ? -1 : 1;
      pushPosition(
        positions,
        index,
        sceneRadius,
        random() * TAU,
        (sign * inclinationDeg * Math.PI) / 180,
        random() * TAU,
        eccentricity,
      );
    }
    return {
      id: `${profile.bodyId}-${stratum}`,
      color: colors[stratum],
      opacityMultiplier: [1, 0.72, 1.14][stratum],
      pointSizeMultiplier: [1, 0.78, 1.45][stratum],
      positions,
      population: populations[stratum],
    } satisfies RegionParticleStratum;
  });
  return {
    bodyId: profile.bodyId,
    kind: profile.kind,
    pointCount: total,
    radialExtent: profile.distribution.radialExtent,
    verticalExtent: profile.distribution.verticalExtent,
    signature: `${profile.kind}:${strata.map((entry) => entry.population).join("|")}`,
    strata,
  };
}

function shellPosition(
  random: () => number,
  radius: number,
  anisotropy: readonly [number, number, number],
): readonly [number, number, number] {
  const cosine = random() * 2 - 1;
  const azimuth = random() * TAU;
  const sine = Math.sqrt(Math.max(0, 1 - cosine * cosine));
  return [
    radius * sine * Math.cos(azimuth) * anisotropy[0],
    radius * cosine * anisotropy[1],
    radius * sine * Math.sin(azimuth) * anisotropy[2],
  ];
}

function oortDistribution(profile: RegionVisualProfile): RegionDistribution {
  const random = seededRandom(0x00a7c10d);
  const total = profile.distribution.pointCount;
  const innerCount = Math.round(total * 0.39);
  const anchorCount = Math.max(12, Math.round(total * 0.025));
  const outerCount = total - innerCount - anchorCount;
  const [innerRadius, outerRadius] = profile.distribution.radialExtent;
  const split = innerRadius + (outerRadius - innerRadius) * 0.34;
  const specs = [
    {
      count: innerCount,
      id: "inner-hills",
      color: "#8ba9c4",
      min: innerRadius,
      max: split,
      alpha: 1,
      size: 0.85,
    },
    {
      count: outerCount,
      id: "outer-oort",
      color: "#67849f",
      min: split,
      max: outerRadius,
      alpha: 0.68,
      size: 0.72,
    },
    {
      count: anchorCount,
      id: "anchor-particles",
      color: "#c9e5fb",
      min: innerRadius,
      max: outerRadius,
      alpha: 1.25,
      size: 1.7,
    },
  ] as const;
  const strata = specs.map((spec, stratum) => {
    const positions = new Float32Array(spec.count * 3);
    for (let index = 0; index < spec.count; index += 1) {
      const radialSample =
        stratum === 0 ? Math.pow(random(), 0.82) : Math.pow(random(), 0.54);
      const radius = spec.min + radialSample * (spec.max - spec.min);
      const anisotropy: readonly [number, number, number] =
        stratum === 0 ? [1.06, 0.72, 0.94] : [1.02, 0.94, 1.08];
      const [x, y, z] = shellPosition(random, radius, anisotropy);
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    }
    return {
      id: `${profile.bodyId}-${spec.id}`,
      color: spec.color,
      opacityMultiplier: spec.alpha,
      pointSizeMultiplier: spec.size,
      positions,
      population: spec.id,
    } satisfies RegionParticleStratum;
  });
  return {
    bodyId: profile.bodyId,
    kind: profile.kind,
    pointCount: total,
    radialExtent: profile.distribution.radialExtent,
    verticalExtent: profile.distribution.verticalExtent,
    signature: "distant-shell:inner-hills|outer-oort|anchor-particles",
    strata,
  };
}

function heliosphereDistribution(
  profile: RegionVisualProfile,
): RegionDistribution {
  const random = seededRandom(0x501a2eed);
  const total = profile.distribution.pointCount;
  const positions = new Float32Array(total * 3);
  const [inner, outer] = profile.distribution.radialExtent;
  for (let index = 0; index < total; index += 1) {
    const radius =
      inner * 0.08 + Math.pow(random(), 0.65) * (outer - inner * 0.08);
    const longitude = random() * TAU;
    const latitude = (random() - 0.5) * Math.PI * 0.76;
    positions[index * 3] =
      radius * Math.cos(latitude) * Math.cos(longitude) * 1.08;
    positions[index * 3 + 1] = radius * Math.sin(latitude) * 0.82;
    positions[index * 3 + 2] =
      radius * Math.cos(latitude) * Math.sin(longitude) * 0.94;
  }
  return {
    bodyId: profile.bodyId,
    kind: profile.kind,
    pointCount: total,
    radialExtent: profile.distribution.radialExtent,
    verticalExtent: profile.distribution.verticalExtent,
    signature: "solar-boundary:radial-flow",
    strata: [
      {
        id: "heliosphere-radial-flow",
        color: "#75b9df",
        opacityMultiplier: 1,
        pointSizeMultiplier: 1,
        positions,
        population: "solar-wind-flow",
      },
    ],
  };
}

export function buildRegionDistribution(
  profile: RegionVisualProfile,
  sceneProfile: SceneProfile,
): RegionDistribution {
  if (profile.kind === "main-belt" || profile.kind === "trans-neptunian-belt") {
    return beltDistribution(profile, sceneProfile);
  }
  if (profile.kind === "distant-shell") return oortDistribution(profile);
  return heliosphereDistribution(profile);
}

export function regionOpacityFor(
  profile: RegionVisualProfile,
  state: RegionVisualState,
  distanceReveal = 0,
): number {
  const selectedMinimum =
    state === "selected"
      ? profile.distribution.selectedOpacity
      : state === "hovered"
        ? profile.distribution.hoveredOpacity
        : profile.distribution.opacity;
  return Math.max(selectedMinimum, Math.max(0, Math.min(1, distanceReveal)));
}

export function regionPointSizeFor(
  profile: RegionVisualProfile,
  state: RegionVisualState,
): number {
  return state === "selected"
    ? profile.distribution.selectedPointSize
    : profile.distribution.pointSize;
}

export function regionFocusAnchorOffset(
  presentation: RegionCameraPresentation,
): readonly [number, number, number] {
  const radialFraction = Number.isFinite(
    presentation.focusAnchor.radialFraction,
  )
    ? presentation.focusAnchor.radialFraction
    : 0;
  const azimuth = Number.isFinite(presentation.focusAnchor.azimuthDeg)
    ? (presentation.focusAnchor.azimuthDeg * Math.PI) / 180
    : 0;
  const heightFraction = Number.isFinite(
    presentation.focusAnchor.heightFraction,
  )
    ? presentation.focusAnchor.heightFraction
    : 0;
  const radius = Math.max(0, presentation.framingExtent * radialFraction);
  return [
    radius * Math.cos(azimuth),
    presentation.framingExtent * heightFraction,
    radius * Math.sin(azimuth),
  ];
}

export function regionMacroEnvelopeOpacityFor(
  profile: RegionVisualProfile,
  state: RegionVisualState,
): number {
  const envelope = profile.macroEnvelope;
  if (!envelope) return 0;
  if (state === "selected") return envelope.selectedOpacity;
  if (state === "hovered") return envelope.hoveredOpacity;
  return envelope.ambientOpacity;
}
