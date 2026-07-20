export interface SceneQuality {
  readonly atmosphereSegments: readonly [number, number];
  readonly dpr: readonly [number, number];
  readonly orbitSegments: number;
  readonly planetSegments: readonly [number, number];
  readonly ringSegments: number;
  readonly starCount: number;
  readonly starSize: number;
}

/**
 * Helios exposes one visual contract. Resource safety remains automatic and is
 * implemented by staged loading, bounded DPR, mipmaps and cache leases rather
 * than a user-facing quality tier.
 */
export const HIGH_VISUAL_CONTRACT: SceneQuality = Object.freeze({
  dpr: [1, 1.75] as const,
  orbitSegments: 192,
  planetSegments: [64, 48] as const,
  atmosphereSegments: [56, 40] as const,
  ringSegments: 256,
  starCount: 1_800,
  starSize: 0.34,
});
