export type CometParticleKind = "dust" | "ion" | "coma";

export interface CometParticleCloud {
  readonly positions: Float32Array;
  readonly opacities: Float32Array;
  readonly sizes: Float32Array;
  readonly count: number;
  readonly signature: string;
}

interface TailParticleOptions {
  readonly bodyId: string;
  readonly kind: Exclude<CometParticleKind, "coma">;
  readonly length: number;
  readonly width: number;
  readonly count: number;
}

interface ComaParticleOptions {
  readonly bodyId: string;
  readonly extent: number;
  readonly count: number;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomGenerator(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function signed(random: () => number): number {
  return random() * 2 - 1;
}

function cloudSignature(
  bodyId: string,
  kind: CometParticleKind,
  positions: Float32Array,
): string {
  let hash = hashString(`${bodyId}:${kind}:${positions.length}`);
  const stride = Math.max(1, Math.floor(positions.length / 37));
  for (let index = 0; index < positions.length; index += stride) {
    hash ^= Math.round((positions[index] ?? 0) * 10_000);
    hash = Math.imul(hash, 16777619);
  }
  return `${kind}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildCometTailParticles({
  bodyId,
  kind,
  length,
  width,
  count,
}: TailParticleOptions): CometParticleCloud {
  const safeCount = Math.max(32, Math.floor(count));
  const safeLength = Math.max(0.01, length);
  const safeWidth = Math.max(0.005, width);
  const random = randomGenerator(hashString(`${bodyId}:${kind}`));
  const positions = new Float32Array(safeCount * 3);
  const opacities = new Float32Array(safeCount);
  const sizes = new Float32Array(safeCount);

  for (let index = 0; index < safeCount; index += 1) {
    // Bias particles toward the nucleus while retaining a long, sparse tail.
    const progress = Math.pow(random(), kind === "dust" ? 1.45 : 1.18);
    const longitudinalJitter = signed(random) * safeLength * 0.012;
    const radiusEnvelope =
      safeWidth *
      (kind === "dust"
        ? 0.045 + Math.pow(progress, 0.72) * 0.96
        : 0.018 + Math.pow(progress, 0.92) * 0.34);
    const radial = Math.sqrt(random()) * radiusEnvelope;
    const angle = random() * Math.PI * 2;
    const turbulence =
      kind === "dust"
        ? Math.sin(progress * 19 + index * 0.37) * safeWidth * 0.075
        : Math.sin(progress * 28 + index * 0.19) * safeWidth * 0.018;
    const drift =
      kind === "dust"
        ? Math.pow(progress, 1.35) * safeWidth * 0.34
        : Math.pow(progress, 1.1) * safeWidth * 0.055;

    const offset = index * 3;
    positions[offset] = Math.cos(angle) * radial + turbulence + drift;
    positions[offset + 1] = -progress * safeLength + longitudinalJitter;
    positions[offset + 2] =
      Math.sin(angle) * radial +
      signed(random) * safeWidth * (kind === "dust" ? 0.085 : 0.025);

    const nucleusBloom = Math.exp(-progress * (kind === "dust" ? 3.2 : 4.8));
    const farFalloff = Math.pow(1 - progress, kind === "dust" ? 0.72 : 0.4);
    const clump =
      kind === "dust" ? 0.68 + random() * 0.32 : 0.82 + random() * 0.18;
    opacities[index] = Math.max(
      0.018,
      Math.min(1, (0.2 + nucleusBloom * 0.8) * farFalloff * clump),
    );
    sizes[index] =
      kind === "dust"
        ? 5.5 + random() * 8.5 + (1 - progress) * 5
        : 3.2 + random() * 4.6 + (1 - progress) * 2.5;
  }

  return Object.freeze({
    positions,
    opacities,
    sizes,
    count: safeCount,
    signature: cloudSignature(bodyId, kind, positions),
  });
}

export function buildComaParticles({
  bodyId,
  extent,
  count,
}: ComaParticleOptions): CometParticleCloud {
  const safeCount = Math.max(48, Math.floor(count));
  const safeExtent = Math.max(0.01, extent);
  const random = randomGenerator(hashString(`${bodyId}:coma`));
  const positions = new Float32Array(safeCount * 3);
  const opacities = new Float32Array(safeCount);
  const sizes = new Float32Array(safeCount);

  for (let index = 0; index < safeCount; index += 1) {
    // Gaussian-like radial density without a hard sphere boundary.
    const radius = Math.pow(random(), 1.9) * safeExtent;
    const cosTheta = signed(random);
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const phi = random() * Math.PI * 2;
    const offset = index * 3;
    positions[offset] = Math.cos(phi) * sinTheta * radius;
    positions[offset + 1] = cosTheta * radius;
    positions[offset + 2] = Math.sin(phi) * sinTheta * radius;
    const normalized = radius / safeExtent;
    opacities[index] = Math.max(0.04, Math.pow(1 - normalized, 1.8));
    sizes[index] = 7 + random() * 12 + (1 - normalized) * 9;
  }

  return Object.freeze({
    positions,
    opacities,
    sizes,
    count: safeCount,
    signature: cloudSignature(bodyId, "coma", positions),
  });
}
