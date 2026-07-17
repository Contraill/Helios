import { describe, expect, it } from "vitest";

import { explorationScale, scientificScale } from "./scale";

describe("scale strategies", () => {
  it("keeps both strategies monotonic", () => {
    const distances = [0.39, 0.72, 1, 1.52, 5.2, 9.54, 19.19, 30.07];

    for (const strategy of [explorationScale, scientificScale]) {
      const mapped = distances.map(strategy.distanceFromAu);
      expect(mapped).toEqual([...mapped].sort((a, b) => a - b));
      expect(mapped.every(Number.isFinite)).toBe(true);
    }
  });

  it("preserves real distance-to-radius ratios in scientific mode", () => {
    const earthDistance = scientificScale.distanceFromAu(1);
    const earthRadius = scientificScale.radiusFromKm(6_371.0084);
    expect(earthDistance / earthRadius).toBeCloseTo(
      149_597_870.7 / 6_371.0084,
      6,
    );
  });

  it("keeps planets usable in exploration mode without claiming true scale", () => {
    expect(explorationScale.isToScale).toBe(false);
    expect(explorationScale.radiusFromKm(2_439.4)).toBeGreaterThan(0.3);
    expect(explorationScale.distanceFromAu(30.07)).toBeLessThan(70);
  });
});
