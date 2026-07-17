import { describe, expect, it } from "vitest";

import {
  ASTRONOMICAL_UNIT_KM,
  astronomicalUnitsToKilometres,
  earthDaysToHours,
  hoursToEarthDays,
  kilometresToAstronomicalUnits,
  kilometresToMiles,
  milesToKilometres,
} from "./units";

describe("unit conversions", () => {
  it("round-trips astronomical units and kilometres", () => {
    expect(
      kilometresToAstronomicalUnits(astronomicalUnitsToKilometres(5.2)),
    ).toBeCloseTo(5.2, 12);
    expect(astronomicalUnitsToKilometres(1)).toBe(ASTRONOMICAL_UNIT_KM);
  });

  it("round-trips kilometres and miles", () => {
    expect(milesToKilometres(kilometresToMiles(42))).toBeCloseTo(42, 12);
  });

  it("round-trips hours and Earth days", () => {
    expect(earthDaysToHours(hoursToEarthDays(24.6))).toBeCloseTo(24.6, 12);
  });

  it("rejects non-finite input", () => {
    expect(() => kilometresToMiles(Number.NaN)).toThrow(RangeError);
  });
});
