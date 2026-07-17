import { describe, expect, it } from "vitest";

import {
  calculatePlanetAge,
  calculateScaleWeightKg,
  calculateSunlightTravelTimeMinutes,
} from "./planet";

const expectFinite = (value: number) =>
  expect(Number.isFinite(value)).toBe(true);

describe("planet calculations", () => {
  it("calculates an Earth scale equivalent from relative gravity", () => {
    const marsReading = calculateScaleWeightKg(70, 3.71);
    expect(marsReading).toBeCloseTo(26.48, 2);
    expectFinite(marsReading);
  });

  it("calculates age using the target orbital period", () => {
    const marsAge = calculatePlanetAge(23, 686.979586);
    expect(marsAge).toBeCloseTo(12.23, 2);
    expectFinite(marsAge);
  });

  it("calculates one-way sunlight travel time", () => {
    const earthMinutes = calculateSunlightTravelTimeMinutes(149_597_870.7);
    expect(earthMinutes).toBeCloseTo(8.3167, 3);
    expectFinite(earthMinutes);
  });

  it.each([
    () => calculateScaleWeightKg(Number.NaN, 3.71),
    () => calculateScaleWeightKg(70, 0),
    () => calculatePlanetAge(23, Number.POSITIVE_INFINITY),
    () => calculateSunlightTravelTimeMinutes(-1),
  ])("rejects invalid input instead of returning NaN", (operation) => {
    expect(operation).toThrow(RangeError);
  });
});
