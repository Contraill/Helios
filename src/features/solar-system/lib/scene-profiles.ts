import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import {
  explorationScale,
  scientificScale,
  type ScaleStrategy,
} from "@/lib/calculations/scale";

export interface SceneProfile {
  readonly id: ScaleMode;
  readonly body: {
    readonly minimumInteractionRadius: number;
    readonly moonMinimumInteractionRadius: number;
    readonly moonMinimumVisualRadius: number;
  };
  readonly camera: {
    readonly focusMinimumDistance: number;
    readonly maximumDistance: number;
    readonly minimumDistance: number;
    readonly overview: Readonly<{
      compactDistance: number;
      landscapeHeightMultiplier: number;
      portraitDistance: number;
      portraitHeightMultiplier: number;
      wideDistance: number;
    }>;
  };
  readonly effects: {
    readonly bloomStrength: number;
    readonly coronaMultiplier: number;
    readonly exposure: number;
    readonly hazeNear: number;
    readonly hazeFar: number;
    readonly starOpacityMultiplier: number;
  };
  readonly backdrop: {
    readonly galaxyPointSize: number;
    readonly galaxyRadius: number;
    readonly localStarsFadeOut: readonly [number, number];
    readonly milkyWayFadeIn: readonly [number, number];
    readonly starFieldScale: number;
  };
  readonly extended: {
    readonly beltCameraFocusRadius: Readonly<{
      asteroid: number;
      kuiper: number;
    }>;
    readonly beltPointSize: Readonly<{
      asteroid: number;
      kuiper: number;
    }>;
    readonly cometTailLength: number;
    readonly minimumInteractionRadius: number;
    readonly oort: Readonly<{
      cameraFocusRadius: number;
      pointSize: number;
      renderRadius: number;
      revealStart: number;
    }>;
    readonly heliosphere: Readonly<{
      cameraFocusRadius: number;
      cmeConeRadius: number;
      missionMarkerScale: number;
    }>;
  };
  readonly scale: {
    readonly bodyProfile: "readable" | "physical-ratio";
    readonly distanceProfile: "compressed" | "shared-ratio";
    readonly strategy: ScaleStrategy;
  };
}

export const SCENE_PROFILES: Readonly<Record<ScaleMode, SceneProfile>> =
  Object.freeze({
    exploration: Object.freeze({
      id: "exploration",
      body: Object.freeze({
        minimumInteractionRadius: 0.72,
        moonMinimumInteractionRadius: 0.2,
        moonMinimumVisualRadius: 0.14,
      }),
      camera: Object.freeze({
        focusMinimumDistance: 4.1,
        minimumDistance: 6,
        maximumDistance: 1_050,
        overview: Object.freeze({
          compactDistance: 108,
          landscapeHeightMultiplier: 0.52,
          portraitDistance: 128,
          portraitHeightMultiplier: 0.74,
          wideDistance: 90,
        }),
      }),
      effects: Object.freeze({
        bloomStrength: 0.1,
        coronaMultiplier: 0.78,
        exposure: 1.08,
        hazeNear: 112,
        hazeFar: 230,
        starOpacityMultiplier: 0.82,
      }),
      backdrop: Object.freeze({
        galaxyPointSize: 1.35,
        galaxyRadius: 520,
        localStarsFadeOut: Object.freeze([180, 380] as const),
        milkyWayFadeIn: Object.freeze([220, 520] as const),
        starFieldScale: 1,
      }),
      extended: Object.freeze({
        beltCameraFocusRadius: Object.freeze({ asteroid: 11, kuiper: 18 }),
        beltPointSize: Object.freeze({ asteroid: 0.075, kuiper: 0.065 }),
        cometTailLength: 3.4,
        minimumInteractionRadius: 0.28,
        oort: Object.freeze({
          cameraFocusRadius: 42,
          pointSize: 0.9,
          renderRadius: 165,
          revealStart: 145,
        }),
        heliosphere: Object.freeze({
          cameraFocusRadius: 24,
          cmeConeRadius: 0.65,
          missionMarkerScale: 0.09,
        }),
      }),
      scale: Object.freeze({
        bodyProfile: "readable",
        distanceProfile: "compressed",
        strategy: explorationScale,
      }),
    }),
    scientific: Object.freeze({
      id: "scientific",
      body: Object.freeze({
        minimumInteractionRadius: 0.32,
        moonMinimumInteractionRadius: 0.025,
        moonMinimumVisualRadius: 0.015,
      }),
      camera: Object.freeze({
        focusMinimumDistance: 0,
        minimumDistance: 2,
        maximumDistance: 5_800,
        overview: Object.freeze({
          compactDistance: 820,
          landscapeHeightMultiplier: 0.42,
          portraitDistance: 1_060,
          portraitHeightMultiplier: 0.58,
          wideDistance: 690,
        }),
      }),
      effects: Object.freeze({
        bloomStrength: 0.18,
        coronaMultiplier: 1,
        exposure: 1,
        hazeNear: 50_000,
        hazeFar: 60_000,
        starOpacityMultiplier: 1,
      }),
      backdrop: Object.freeze({
        galaxyPointSize: 8,
        galaxyRadius: 3_200,
        localStarsFadeOut: Object.freeze([1_100, 2_400] as const),
        milkyWayFadeIn: Object.freeze([1_300, 2_900] as const),
        starFieldScale: 30,
      }),
      extended: Object.freeze({
        beltCameraFocusRadius: Object.freeze({ asteroid: 8, kuiper: 120 }),
        beltPointSize: Object.freeze({ asteroid: 0.06, kuiper: 0.06 }),
        cometTailLength: 0.48,
        minimumInteractionRadius: 0.26,
        oort: Object.freeze({
          cameraFocusRadius: 520,
          pointSize: 1.35,
          renderRadius: 720,
          revealStart: 650,
        }),
        heliosphere: Object.freeze({
          cameraFocusRadius: 240,
          cmeConeRadius: 0.1,
          missionMarkerScale: 0.12,
        }),
      }),
      scale: Object.freeze({
        bodyProfile: "physical-ratio",
        distanceProfile: "shared-ratio",
        strategy: scientificScale,
      }),
    }),
  });

export function sceneProfileFor(mode: ScaleMode): SceneProfile {
  return SCENE_PROFILES[mode];
}
