import { assertNonNegativeNumber } from "./guards";
import { ASTRONOMICAL_UNIT_KM } from "./units";

export interface ScaleStrategy {
  readonly id: "exploration" | "scientific";
  readonly isToScale: boolean;
  distanceFromAu(au: number): number;
  radiusFromKm(km: number): number;
}

const SCIENTIFIC_SCENE_UNITS_PER_AU = 12;
const EARTH_MEAN_RADIUS_KM = 6_371.0084;

export const scientificScale: ScaleStrategy = Object.freeze({
  id: "scientific",
  isToScale: true,
  distanceFromAu(au: number): number {
    assertNonNegativeNumber(au, "Distance");
    return au * SCIENTIFIC_SCENE_UNITS_PER_AU;
  },
  radiusFromKm(km: number): number {
    assertNonNegativeNumber(km, "Radius");
    return (km / ASTRONOMICAL_UNIT_KM) * SCIENTIFIC_SCENE_UNITS_PER_AU;
  },
});

/**
 * Deliberately non-linear presentation scale. Distances use log1p while radii
 * use a power curve, so planets remain selectable without implying true scale.
 */
export const explorationScale: ScaleStrategy = Object.freeze({
  id: "exploration",
  isToScale: false,
  distanceFromAu(au: number): number {
    assertNonNegativeNumber(au, "Distance");
    return au === 0 ? 0 : 7 + Math.log1p(au * 2.4) * 13;
  },
  radiusFromKm(km: number): number {
    assertNonNegativeNumber(km, "Radius");
    return km === 0 ? 0 : Math.pow(km / EARTH_MEAN_RADIUS_KM, 0.42) * 0.62;
  },
});
