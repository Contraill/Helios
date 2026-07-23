import { describe, expect, it } from "vitest";

import { createSolarProminenceCurve } from "./solar-prominence";

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
});
