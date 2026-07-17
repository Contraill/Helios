import type { QualityLevel } from "@/features/solar-system/types/experience-settings";

export interface SceneQuality {
  readonly dpr: [number, number];
  readonly orbitSegments: number;
  readonly planetSegments: readonly [number, number];
  readonly starCount: number;
  readonly starSize: number;
}

export const SCENE_QUALITY: Readonly<Record<QualityLevel, SceneQuality>> =
  Object.freeze({
    low: Object.freeze({
      dpr: [1, 1] as [number, number],
      orbitSegments: 64,
      planetSegments: [18, 12] as const,
      starCount: 320,
      starSize: 0.5,
    }),
    medium: Object.freeze({
      dpr: [1, 1.5] as [number, number],
      orbitSegments: 128,
      planetSegments: [28, 20] as const,
      starCount: 900,
      starSize: 0.42,
    }),
    high: Object.freeze({
      dpr: [1, 2] as [number, number],
      orbitSegments: 192,
      planetSegments: [42, 30] as const,
      starCount: 1_800,
      starSize: 0.34,
    }),
  });
