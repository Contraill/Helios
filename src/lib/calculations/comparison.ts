import { assertFiniteNumber, assertPositiveNumber } from "./guards";
import { HOURS_PER_EARTH_DAY } from "./units";

export function calculateRatio(value: number, reference: number): number {
  assertFiniteNumber(value, "Value");
  assertPositiveNumber(reference, "Reference value");
  return value / reference;
}

export function calculatePercentageDifference(
  value: number,
  reference: number,
): number {
  return (calculateRatio(value, reference) - 1) * 100;
}

export function calculateTemperatureDifferenceC(
  targetC: number,
  referenceC: number,
): number {
  assertFiniteNumber(targetC, "Target temperature");
  assertFiniteNumber(referenceC, "Reference temperature");
  return targetC - referenceC;
}

export function calculateLocalDaysPerOrbit(
  orbitalPeriodEarthDays: number,
  localSolarDayHours: number,
): number {
  assertPositiveNumber(orbitalPeriodEarthDays, "Orbital period");
  assertPositiveNumber(localSolarDayHours, "Local solar day");
  return (orbitalPeriodEarthDays * HOURS_PER_EARTH_DAY) / localSolarDayHours;
}

export function calculateDayLengthDifferenceMinutes(
  localSolarDayHours: number,
): number {
  assertPositiveNumber(localSolarDayHours, "Local solar day");
  return (localSolarDayHours - HOURS_PER_EARTH_DAY) * 60;
}
