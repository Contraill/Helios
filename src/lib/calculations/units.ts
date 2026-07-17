import { assertFiniteNumber } from "./guards";

/** IAU 2012 exact astronomical unit, in kilometres. */
export const ASTRONOMICAL_UNIT_KM = 149_597_870.7;
/** Exact speed of light in vacuum, expressed in kilometres per second. */
export const SPEED_OF_LIGHT_KM_S = 299_792.458;
export const HOURS_PER_EARTH_DAY = 24;
export const MEAN_EARTH_YEAR_DAYS = 365.2425;
export const KM_PER_MILE = 1.609344;

export function astronomicalUnitsToKilometres(au: number): number {
  assertFiniteNumber(au, "Astronomical units");
  return au * ASTRONOMICAL_UNIT_KM;
}

export function kilometresToAstronomicalUnits(kilometres: number): number {
  assertFiniteNumber(kilometres, "Kilometres");
  return kilometres / ASTRONOMICAL_UNIT_KM;
}

export function kilometresToMiles(kilometres: number): number {
  assertFiniteNumber(kilometres, "Kilometres");
  return kilometres / KM_PER_MILE;
}

export function milesToKilometres(miles: number): number {
  assertFiniteNumber(miles, "Miles");
  return miles * KM_PER_MILE;
}

export function hoursToEarthDays(hours: number): number {
  assertFiniteNumber(hours, "Hours");
  return hours / HOURS_PER_EARTH_DAY;
}

export function earthDaysToHours(days: number): number {
  assertFiniteNumber(days, "Earth days");
  return days * HOURS_PER_EARTH_DAY;
}
