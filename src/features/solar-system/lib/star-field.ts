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

export function createStarPositions(
  count: number,
  seed = 0x48454c49,
): Float32Array {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("Star count must be a non-negative integer.");
  }

  const random = mulberry32(seed);
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 105 + random() * 75;
    const cosine = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const sine = Math.sqrt(1 - cosine * cosine);
    const offset = index * 3;

    positions[offset] = radius * sine * Math.cos(azimuth);
    positions[offset + 1] = radius * cosine;
    positions[offset + 2] = radius * sine * Math.sin(azimuth);
  }

  return positions;
}
