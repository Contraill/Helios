import { describe, expect, it } from "vitest";

import {
  createSolarProminenceCurve,
  solarProminenceEnvelope,
} from "./solar-prominence";

describe("solar prominence geometry", () => {
  it("anchors both ends into the solar surface and lifts the midpoint", () => {
    const anchorRadius = 0.995;
    const curve = createSolarProminenceCurve({
      anchorRadius,
      lift: 0.28,
      spanRadians: 0.9,
    });

    expect(curve.getPoint(0).length()).toBeCloseTo(anchorRadius, 12);
    expect(curve.getPoint(1).length()).toBeCloseTo(anchorRadius, 12);
    expect(curve.getPoint(0.5).length()).toBeCloseTo(anchorRadius + 0.28, 12);
  });

  it("staggers emergence and decay while remaining deterministic", () => {
    expect(solarProminenceEnvelope(0, 0, 12)).toBe(0);
    expect(solarProminenceEnvelope(3, 0, 12)).toBeGreaterThan(0.95);
    expect(solarProminenceEnvelope(11.9, 0, 12)).toBeLessThan(0.05);
    expect(solarProminenceEnvelope(3, 0.25, 12)).not.toBe(
      solarProminenceEnvelope(3, 0, 12),
    );
  });

  it("rejects invalid timing contracts", () => {
    expect(() => solarProminenceEnvelope(1, 0, 0)).toThrow(RangeError);
  });
});
