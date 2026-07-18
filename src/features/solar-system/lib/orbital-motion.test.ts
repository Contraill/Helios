import { describe, expect, it } from "vitest";

import {
  advanceAngle,
  orbitalAngularVelocity,
  orbitalPosition,
  rotationAngleAt,
  rotationAngularVelocity,
  wrapAngle,
} from "./orbital-motion";

describe("orbital motion", () => {
  it("advances by delta time rather than frame count", () => {
    const velocity = orbitalAngularVelocity(100, 5);
    const oneStep = advanceAngle(0, velocity, 2);
    const twoSteps = advanceAngle(advanceAngle(0, velocity, 1), velocity, 1);
    expect(oneStep).toBeCloseTo(twoSteps, 12);
  });

  it("keeps angles inside one full turn", () => {
    expect(wrapAngle(Math.PI * 7)).toBeCloseTo(Math.PI, 12);
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo(Math.PI * 1.5, 12);
  });

  it("reverses axial rotation for retrograde planets", () => {
    expect(rotationAngularVelocity(24, false)).toBeGreaterThan(0);
    expect(rotationAngularVelocity(24, true)).toBeLessThan(0);
  });

  it("derives axial phase from the shared simulation timestamp", () => {
    const sixHoursMs = 6 * 3_600_000;
    expect(rotationAngleAt(sixHoursMs, 24, false)).toBeCloseTo(Math.PI / 2);
    expect(rotationAngleAt(sixHoursMs, 24, true)).toBeCloseTo(-Math.PI / 2);
  });

  it("returns the major and minor axis extrema", () => {
    expect(orbitalPosition(0, 12, 8)).toEqual([12, 0, 0]);
    const quarter = orbitalPosition(Math.PI / 2, 12, 8);
    expect(quarter[0]).toBeCloseTo(0, 12);
    expect(quarter[2]).toBeCloseTo(8, 12);
  });

  it("rejects invalid periods and negative delta time", () => {
    expect(() => orbitalAngularVelocity(0)).toThrow(RangeError);
    expect(() => advanceAngle(0, 1, -0.1)).toThrow(RangeError);
  });
});
