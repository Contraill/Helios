import type { PlanetId } from "@/lib/data/schemas/planet";

export interface AtmosphereProfile {
  readonly color: string;
  readonly fresnelPower: number;
  readonly opacity: number;
  readonly radiusScale: number;
}

export interface PlanetVisualProfile {
  readonly atmosphere: AtmosphereProfile | null;
  readonly roughness: number;
  readonly surfaceTint: string;
}

export const PLANET_VISUAL_PROFILES: Readonly<
  Record<PlanetId, PlanetVisualProfile>
> = Object.freeze({
  mercury: Object.freeze({
    atmosphere: null,
    roughness: 0.94,
    surfaceTint: "#aaaaaa",
  }),
  venus: Object.freeze({
    atmosphere: Object.freeze({
      color: "#f1c27c",
      fresnelPower: 2.1,
      opacity: 0.28,
      radiusScale: 1.055,
    }),
    roughness: 0.82,
    surfaceTint: "#a6a6a6",
  }),
  earth: Object.freeze({
    atmosphere: Object.freeze({
      color: "#79bfff",
      fresnelPower: 3.4,
      opacity: 0.34,
      radiusScale: 1.035,
    }),
    roughness: 0.76,
    surfaceTint: "#ffffff",
  }),
  mars: Object.freeze({
    atmosphere: Object.freeze({
      color: "#e6a277",
      fresnelPower: 2.8,
      opacity: 0.11,
      radiusScale: 1.025,
    }),
    roughness: 0.92,
    surfaceTint: "#f0f0f0",
  }),
  jupiter: Object.freeze({
    atmosphere: Object.freeze({
      color: "#e9c79f",
      fresnelPower: 2.4,
      opacity: 0.2,
      radiusScale: 1.025,
    }),
    roughness: 0.88,
    surfaceTint: "#f4f4f4",
  }),
  saturn: Object.freeze({
    atmosphere: Object.freeze({
      color: "#f0d7a4",
      fresnelPower: 2.6,
      opacity: 0.18,
      radiusScale: 1.025,
    }),
    roughness: 0.9,
    surfaceTint: "#ffffff",
  }),
  uranus: Object.freeze({
    atmosphere: Object.freeze({
      color: "#9ae6eb",
      fresnelPower: 2.25,
      opacity: 0.3,
      radiusScale: 1.04,
    }),
    roughness: 0.84,
    surfaceTint: "#ffffff",
  }),
  neptune: Object.freeze({
    atmosphere: Object.freeze({
      color: "#4e83ff",
      fresnelPower: 2.5,
      opacity: 0.36,
      radiusScale: 1.045,
    }),
    roughness: 0.82,
    surfaceTint: "#ffffff",
  }),
});
