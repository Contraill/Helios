import type { QualityLevel } from "@/features/solar-system/types/experience-settings";
import type { TextureVariantName } from "@/content/sources/planet-textures";

export type AtmosphereMode = "simple" | "fresnel";

export interface SceneQuality {
  readonly dpr: [number, number];
  readonly orbitSegments: number;
  readonly planetSegments: readonly [number, number];
  readonly atmosphereMode: AtmosphereMode;
  readonly atmosphereSegments: readonly [number, number];
  readonly bloomStrength: number;
  readonly ringSegments: number;
  readonly textureVariant: TextureVariantName;
  readonly starCount: number;
  readonly starSize: number;
}

export const SCENE_QUALITY: Readonly<Record<QualityLevel, SceneQuality>> =
  Object.freeze({
    low: Object.freeze({
      dpr: [1, 1] as [number, number],
      orbitSegments: 64,
      planetSegments: [18, 12] as const,
      atmosphereMode: "simple",
      atmosphereSegments: [18, 12] as const,
      bloomStrength: 0,
      ringSegments: 48,
      textureVariant: "low",
      starCount: 320,
      starSize: 0.5,
    }),
    medium: Object.freeze({
      dpr: [1, 1.25] as [number, number],
      orbitSegments: 128,
      planetSegments: [32, 24] as const,
      atmosphereMode: "fresnel",
      atmosphereSegments: [28, 20] as const,
      bloomStrength: 0,
      ringSegments: 96,
      textureVariant: "medium",
      starCount: 900,
      starSize: 0.42,
    }),
    high: Object.freeze({
      dpr: [1, 1.75] as [number, number],
      orbitSegments: 192,
      planetSegments: [64, 48] as const,
      atmosphereMode: "fresnel",
      atmosphereSegments: [56, 40] as const,
      bloomStrength: 0.18,
      ringSegments: 256,
      textureVariant: "high",
      starCount: 1_800,
      starSize: 0.34,
    }),
  });
