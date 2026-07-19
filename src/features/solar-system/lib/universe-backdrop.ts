import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

export interface UniverseLayerOpacities {
  readonly localStars: number;
  readonly milkyWay: number;
}

export interface ColoredParticleData {
  readonly colors: Float32Array;
  readonly positions: Float32Array;
}

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

export function universeLayerOpacities(
  distanceFromSun: number,
  scaleMode: ScaleMode,
): UniverseLayerOpacities {
  const distance = Math.max(0, distanceFromSun);
  const thresholds =
    scaleMode === "scientific"
      ? {
          localOut: [1_100, 2_400] as const,
          milkyWayIn: [1_300, 2_900] as const,
        }
      : {
          localOut: [180, 380] as const,
          milkyWayIn: [220, 520] as const,
        };

  const localStars = 1 - smoothRange(thresholds.localOut, distance);
  const milkyWay = smoothRange(thresholds.milkyWayIn, distance);

  return { localStars, milkyWay };
}

export function createMilkyWayParticleData(
  count: number,
  seed = 0x4d494c4b,
): ColoredParticleData {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(
      "Milky Way particle count must be a non-negative integer.",
    );
  }

  const random = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const bulgeParticle = random() < 0.27;
    const radial = bulgeParticle
      ? Math.pow(random(), 2.35) * 0.34
      : 0.1 + Math.pow(random(), 0.7) * 0.9;
    const arm = Math.floor(random() * 5);
    const angle =
      arm * ((Math.PI * 2) / 5) +
      radial * Math.PI * 3.75 +
      (random() - 0.5) * (0.14 + radial * 0.5);
    const diskThickness = bulgeParticle
      ? (0.14 - radial * 0.24) * (random() - 0.5)
      : (0.038 - radial * 0.018) * (random() - 0.5);

    // Dark-lane separation is represented by subtly displacing a subset of
    // outer-disk stars away from each arm's centre line.
    const laneOffset =
      !bulgeParticle && random() < 0.23
        ? (random() < 0.5 ? -1 : 1) * (0.018 + radial * 0.024)
        : 0;

    positions[offset] = (radial + laneOffset) * Math.cos(angle);
    positions[offset + 1] = diskThickness;
    positions[offset + 2] = (radial + laneOffset) * Math.sin(angle);

    const centerWarmth = 1 - radial;
    const youngBlueStar = !bulgeParticle && random() < 0.2;
    colors[offset] = youngBlueStar ? 0.54 : 0.68 + centerWarmth * 0.32;
    colors[offset + 1] = youngBlueStar ? 0.72 : 0.74 + centerWarmth * 0.18;
    colors[offset + 2] = youngBlueStar ? 1 : 0.92 - centerWarmth * 0.3;
  }

  return { colors, positions };
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
