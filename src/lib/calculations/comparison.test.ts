import { describe, expect, it } from "vitest";

import {
  calculateDayLengthDifferenceMinutes,
  calculateLocalDaysPerOrbit,
  calculatePercentageDifference,
  calculateRatio,
  calculateTemperatureDifferenceC,
} from "./comparison";

describe("comparison calculations", () => {
  it("calculates ratios and percentage differences", () => {
    expect(calculateRatio(3.71, 9.80665)).toBeCloseTo(0.3783, 4);
    expect(calculatePercentageDifference(3.71, 9.80665)).toBeCloseTo(-62.17, 2);
  });

  it("compares temperatures without losing negative values", () => {
    expect(calculateTemperatureDifferenceC(-65, 15)).toBe(-80);
  });

  it("converts orbital duration into local solar days", () => {
    expect(calculateLocalDaysPerOrbit(686.979586, 24.6597)).toBeCloseTo(
      668.6,
      2,
    );
  });

  it("expresses local day difference from an Earth day in minutes", () => {
    expect(calculateDayLengthDifferenceMinutes(24.6597)).toBeCloseTo(39.582, 3);
  });

  it("rejects invalid comparison inputs", () => {
    expect(() => calculateRatio(1, 0)).toThrow();
    expect(() => calculateLocalDaysPerOrbit(1, Number.NaN)).toThrow();
  });
});
