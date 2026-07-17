import { assertNonNegativeNumber, assertPositiveNumber } from "./guards";
import { MEAN_EARTH_YEAR_DAYS, SPEED_OF_LIGHT_KM_S } from "./units";

/** Standard gravity used to express an Earth scale reading. */
export const STANDARD_EARTH_GRAVITY_MS2 = 9.80665;

export function calculateScaleWeightKg(
  earthScaleReadingKg: number,
  targetGravityMS2: number,
  earthGravityMS2 = STANDARD_EARTH_GRAVITY_MS2,
): number {
  assertNonNegativeNumber(earthScaleReadingKg, "Earth scale reading");
  assertPositiveNumber(targetGravityMS2, "Target gravity");
  assertPositiveNumber(earthGravityMS2, "Earth gravity");

  return earthScaleReadingKg * (targetGravityMS2 / earthGravityMS2);
}

export function calculatePlanetAge(
  earthAgeYears: number,
  orbitalPeriodEarthDays: number,
): number {
  assertNonNegativeNumber(earthAgeYears, "Earth age");
  assertPositiveNumber(orbitalPeriodEarthDays, "Orbital period");

  const elapsedEarthDays = earthAgeYears * MEAN_EARTH_YEAR_DAYS;
  return elapsedEarthDays / orbitalPeriodEarthDays;
}

export function calculateSunlightTravelTimeMinutes(
  distanceFromSunKm: number,
): number {
  assertNonNegativeNumber(distanceFromSunKm, "Distance from Sun");
  return distanceFromSunKm / SPEED_OF_LIGHT_KM_S / 60;
}
