import type { SceneProfile } from "@/features/solar-system/lib/scene-profiles";

export interface UniverseLayerOpacities {
  readonly localStars: number;
  readonly milkyWay: number;
}

export interface ColoredParticleData {
  readonly colors: Float32Array;
  readonly positions: Float32Array;
}

export interface GalacticParticleData extends ColoredParticleData {
  readonly opacities: Float32Array;
  readonly sizes: Float32Array;
}

/**
 * Exterior map proportions follow the current NASA/JPL artist-concept model:
 * a barred spiral with two dominant stellar arms, two weaker gas-rich arms,
 * and the Solar System in the Orion Spur between Sagittarius and Perseus.
 *
 * Sources:
 * https://science.nasa.gov/resource/the-milky-way-galaxy/
 * https://science.nasa.gov/solar-system/solar-system-facts/
 */
export const MILKY_WAY_MODEL = Object.freeze({
  diameterLightYears: 100_000,
  majorArmCount: 2,
  minorArmCount: 2,
  solarDistanceLightYears: 26_000,
  solarRadiusRatio: 0.52,
  solarNeighbourhood: "Orion Spur",
} as const);

const SOLAR_POSITION_ANGLE = -0.38;

export const SOLAR_SYSTEM_GALACTIC_POSITION = Object.freeze([
  MILKY_WAY_MODEL.solarRadiusRatio * Math.cos(SOLAR_POSITION_ANGLE),
  0.008,
  MILKY_WAY_MODEL.solarRadiusRatio * Math.sin(SOLAR_POSITION_ANGLE),
] as const);

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function smoothstep(start: number, end: number, value: number): number {
  if (start === end) return value < start ? 0 : 1;
  const normalized = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return normalized * normalized * (3 - 2 * normalized);
}

function smoothRange(range: readonly [number, number], value: number): number {
  return smoothstep(range[0], range[1], value);
}

export interface GalacticViewInput {
  readonly cameraMode: string | null;
  readonly cameraPosition: readonly [number, number, number];
  readonly cameraTarget: readonly [number, number, number];
  readonly selectedBodyId: string | null;
}

/**
 * Distant-body focus must not be mistaken for leaving the Solar System.
 * Galactic context is available only when the camera is looking back toward
 * the local origin without an active celestial selection.
 */
export function galacticContextDistance(
  input: GalacticViewInput,
  profile: SceneProfile,
): number {
  if (
    input.selectedBodyId !== null ||
    input.cameraMode === "focus" ||
    (input.cameraMode === "transition" && input.selectedBodyId !== null)
  ) {
    return 0;
  }
  const targetDistance = Math.hypot(...input.cameraTarget);
  const centralTargetLimit = profile.backdrop.milkyWayFadeIn[0] * 0.12;
  if (targetDistance > centralTargetLimit) return 0;

  const distanceFromOrigin = Math.hypot(...input.cameraPosition);
  const distanceToTarget = Math.hypot(
    input.cameraPosition[0] - input.cameraTarget[0],
    input.cameraPosition[1] - input.cameraTarget[1],
    input.cameraPosition[2] - input.cameraTarget[2],
  );
  return Math.min(distanceFromOrigin, distanceToTarget);
}

export function universeLayerOpacities(
  distanceFromSun: number,
  profile: SceneProfile,
): UniverseLayerOpacities {
  const distance = Math.max(0, distanceFromSun);
  const localStars =
    1 - smoothRange(profile.backdrop.localStarsFadeOut, distance);
  const milkyWay = smoothRange(profile.backdrop.milkyWayFadeIn, distance);

  return { localStars, milkyWay };
}

export type GalacticContextPhase = "local" | "transition" | "galactic";

export function galacticContextPhase(
  distanceFromSun: number,
  profile: SceneProfile,
): GalacticContextPhase {
  const { milkyWay } = universeLayerOpacities(distanceFromSun, profile);
  if (milkyWay < 0.08) return "local";
  if (milkyWay < 0.82) return "transition";
  return "galactic";
}

export function galacticMapRadius(
  distanceFromSun: number,
  profile: SceneProfile,
): number {
  return Math.min(
    profile.backdrop.galaxyRadius,
    Math.max(0, distanceFromSun) * 0.41,
  );
}

function centeredNoise(random: () => number): number {
  return random() + random() + random() - 1.5;
}

function writeParticle(
  data: GalacticParticleData,
  index: number,
  position: readonly [number, number, number],
  color: readonly [number, number, number],
  size: number,
  opacity: number,
): void {
  const offset = index * 3;
  data.positions[offset] = position[0];
  data.positions[offset + 1] = position[1];
  data.positions[offset + 2] = position[2];
  data.colors[offset] = color[0];
  data.colors[offset + 1] = color[1];
  data.colors[offset + 2] = color[2];
  data.sizes[index] = size;
  data.opacities[index] = opacity;
}

function spiralPosition(
  random: () => number,
  phase: number,
  startRadius: number,
  endRadius: number,
  pitchDeg: number,
  armWidth: number,
): readonly [number, number, number] {
  const progress = Math.pow(random(), 0.86);
  const radius = startRadius + (endRadius - startRadius) * progress;
  const pitch = (pitchDeg * Math.PI) / 180;
  const angle =
    phase +
    Math.log(radius / startRadius) / Math.tan(pitch) +
    centeredNoise(random) * armWidth * (0.72 + radius * 0.45);
  const radialScatter = centeredNoise(random) * armWidth * 0.24;
  const resolvedRadius = Math.max(0.02, radius + radialScatter);
  const thickness =
    centeredNoise(random) * (0.046 - Math.min(0.026, radius * 0.022));
  return [
    Math.cos(angle) * resolvedRadius,
    thickness,
    Math.sin(angle) * resolvedRadius,
  ];
}

export function createMilkyWayParticleData(
  count: number,
  seed = 0x4d494c4b,
): GalacticParticleData {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(
      "Milky Way particle count must be a non-negative integer.",
    );
  }

  const random = mulberry32(seed);
  const data: GalacticParticleData = {
    colors: new Float32Array(count * 3),
    opacities: new Float32Array(count),
    positions: new Float32Array(count * 3),
    sizes: new Float32Array(count),
  };

  for (let index = 0; index < count; index += 1) {
    const population = index / Math.max(1, count);
    let position: readonly [number, number, number];
    let color: readonly [number, number, number];
    let size: number;
    let opacity: number;

    if (population < 0.18) {
      const radius = Math.pow(random(), 2.25) * 0.28;
      const angle = random() * Math.PI * 2;
      position = [
        Math.cos(angle) * radius,
        centeredNoise(random) * (0.13 - radius * 0.3),
        Math.sin(angle) * radius,
      ];
      color = [1, 0.72 + random() * 0.17, 0.45 + random() * 0.22];
      size = 1.1 + random() * 1.5;
      opacity = 0.48 + random() * 0.5;
    } else if (population < 0.3) {
      const alongBar = centeredNoise(random) * 0.47;
      const acrossBar = centeredNoise(random) * 0.075;
      const barAngle = 0.42;
      position = [
        alongBar * Math.cos(barAngle) - acrossBar * Math.sin(barAngle),
        centeredNoise(random) * 0.055,
        alongBar * Math.sin(barAngle) + acrossBar * Math.cos(barAngle),
      ];
      color = [1, 0.74 + random() * 0.16, 0.52 + random() * 0.2];
      size = 0.95 + random() * 1.25;
      opacity = 0.42 + random() * 0.48;
    } else if (population < 0.69) {
      const arm = index % MILKY_WAY_MODEL.majorArmCount;
      position = spiralPosition(
        random,
        arm * Math.PI + 0.42,
        0.17,
        0.98,
        16.5,
        0.1,
      );
      const youngStar = random() < 0.24;
      color = youngStar
        ? [0.48 + random() * 0.16, 0.7 + random() * 0.18, 1]
        : [
            0.78 + random() * 0.22,
            0.8 + random() * 0.17,
            0.86 + random() * 0.14,
          ];
      size = 0.72 + random() * (youngStar ? 1.45 : 0.92);
      opacity = 0.3 + random() * 0.58;
    } else if (population < 0.84) {
      const arm = index % MILKY_WAY_MODEL.minorArmCount;
      position = spiralPosition(
        random,
        Math.PI / 2 + arm * Math.PI + 0.42,
        0.24,
        0.84,
        18,
        0.13,
      );
      const starForming = random() < 0.31;
      color = starForming
        ? [0.46, 0.7 + random() * 0.18, 1]
        : [
            0.75 + random() * 0.2,
            0.77 + random() * 0.18,
            0.86 + random() * 0.12,
          ];
      size = 0.68 + random() * 1.1;
      opacity = 0.24 + random() * 0.48;
    } else if (population < 0.9) {
      const radius = 0.43 + random() * 0.21;
      const angle =
        SOLAR_POSITION_ANGLE +
        (radius - MILKY_WAY_MODEL.solarRadiusRatio) * 2.25 +
        centeredNoise(random) * 0.17;
      position = [
        Math.cos(angle) * radius,
        centeredNoise(random) * 0.018,
        Math.sin(angle) * radius,
      ];
      color =
        random() < 0.28
          ? [0.48, 0.73, 1]
          : [0.82 + random() * 0.16, 0.84 + random() * 0.14, 0.94];
      size = 0.78 + random() * 1.28;
      opacity = 0.38 + random() * 0.52;
    } else if (population < 0.98) {
      const radius = 0.16 + Math.sqrt(random()) * 0.84;
      const angle = random() * Math.PI * 2;
      position = [
        Math.cos(angle) * radius,
        centeredNoise(random) * (0.075 - radius * 0.035),
        Math.sin(angle) * radius,
      ];
      color = [
        0.68 + random() * 0.24,
        0.72 + random() * 0.2,
        0.82 + random() * 0.18,
      ];
      size = 0.55 + random() * 0.8;
      opacity = 0.16 + random() * 0.38;
    } else {
      const radius = 0.22 + Math.pow(random(), 0.6) * 0.95;
      const cosine = random() * 2 - 1;
      const azimuth = random() * Math.PI * 2;
      const sine = Math.sqrt(1 - cosine * cosine);
      position = [
        radius * sine * Math.cos(azimuth),
        radius * cosine * 0.55,
        radius * sine * Math.sin(azimuth),
      ];
      color = [
        0.68 + random() * 0.2,
        0.72 + random() * 0.18,
        0.9 + random() * 0.1,
      ];
      size = 0.52 + random() * 0.72;
      opacity = 0.1 + random() * 0.28;
    }

    writeParticle(data, index, position, color, size, opacity);
  }

  return data;
}

export function createMilkyWayDustParticleData(
  count: number,
  seed = 0x44555354,
): GalacticParticleData {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(
      "Milky Way dust particle count must be a non-negative integer.",
    );
  }
  const random = mulberry32(seed);
  const data: GalacticParticleData = {
    colors: new Float32Array(count * 3),
    opacities: new Float32Array(count),
    positions: new Float32Array(count * 3),
    sizes: new Float32Array(count),
  };
  for (let index = 0; index < count; index += 1) {
    const major = index / Math.max(1, count) < 0.72;
    const arm = index % 2;
    const position = spiralPosition(
      random,
      (major ? 0 : Math.PI / 2) + arm * Math.PI + 0.34,
      major ? 0.2 : 0.28,
      major ? 0.96 : 0.8,
      major ? 16.5 : 18,
      major ? 0.07 : 0.09,
    );
    writeParticle(
      data,
      index,
      [position[0], position[1] * 0.38, position[2]],
      [0.045 + random() * 0.025, 0.022 + random() * 0.018, 0.012],
      1.8 + random() * 2.8,
      0.2 + random() * 0.48,
    );
  }
  return data;
}

export function createDeepFieldParticleData(
  count: number,
  seed = 0x44454550,
): ColoredParticleData {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(
      "Deep-field particle count must be a non-negative integer.",
    );
  }

  const random = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = 0.82 + random() * 0.18;
    const cosine = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const sine = Math.sqrt(1 - cosine * cosine);
    const palette = random();

    positions[offset] = radius * sine * Math.cos(azimuth);
    positions[offset + 1] = radius * cosine;
    positions[offset + 2] = radius * sine * Math.sin(azimuth);

    colors[offset] = palette < 0.18 ? 1 : 0.68 + random() * 0.24;
    colors[offset + 1] = palette < 0.18 ? 0.7 : 0.74 + random() * 0.2;
    colors[offset + 2] = palette < 0.18 ? 0.48 : 0.88 + random() * 0.12;
  }

  return { colors, positions };
}
