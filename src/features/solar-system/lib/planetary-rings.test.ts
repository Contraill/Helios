import { describe, expect, it } from "vitest";

import {
  PLANETARY_RING_PROFILES,
  SATURN_RING_OUTER_RADIUS,
  planetaryRingOuterRadius,
} from "./planetary-rings";

describe("giant-planet ring profiles", () => {
  it("models Jupiter as a faint halo, main ring and two gossamer regions", () => {
    const bands = PLANETARY_RING_PROFILES.jupiter.bands;
    expect(bands.map(({ id }) => id)).toEqual([
      "halo",
      "main",
      "amalthea-gossamer",
      "thebe-gossamer",
    ]);
    expect(bands[1].outerRadius).toBeCloseTo(1.806, 3);
    expect(bands[1].opacity).toBeGreaterThan(bands[0].opacity);
    expect(Math.max(...bands.map(({ opacity }) => opacity))).toBeLessThan(0.1);
  });

  it("keeps all 13 named Uranian rings in increasing radial order with epsilon emphasis", () => {
    const bands = PLANETARY_RING_PROFILES.uranus.bands;
    expect(bands).toHaveLength(13);
    expect(bands.map(({ id }) => id)).toEqual([
      "zeta",
      "6",
      "5",
      "4",
      "alpha",
      "beta",
      "eta",
      "gamma",
      "delta",
      "lambda",
      "epsilon",
      "nu",
      "mu",
    ]);
    expect(
      bands.every(
        (ring, index) =>
          index === 0 || ring.innerRadius > bands[index - 1].innerRadius,
      ),
    ).toBe(true);
    const epsilon = bands.find(({ id }) => id === "epsilon")!;
    expect(epsilon.opacity).toBe(
      Math.max(...bands.map(({ opacity }) => opacity)),
    );
  });

  it("models Neptune's five main rings and open Adams-ring arcs", () => {
    const profile = PLANETARY_RING_PROFILES.neptune;
    expect(profile.bands).toHaveLength(5);
    expect(profile.arcs).toHaveLength(4);
    expect(profile.bands.at(-1)?.id).toBe("adams");
    expect(
      profile.arcs.every(
        ({ arcLength }) => arcLength > 0 && arcLength < Math.PI * 2,
      ),
    ).toBe(true);
    expect(
      profile.arcs.every(
        ({ innerRadius, outerRadius }) =>
          innerRadius < profile.bands.at(-1)!.outerRadius &&
          outerRadius > profile.bands.at(-1)!.innerRadius,
      ),
    ).toBe(true);
  });

  it("keeps every ring outside its planet with a positive width", () => {
    for (const profile of Object.values(PLANETARY_RING_PROFILES)) {
      for (const ring of [...profile.bands, ...profile.arcs]) {
        expect(ring.innerRadius).toBeGreaterThan(1);
        expect(ring.outerRadius).toBeGreaterThan(ring.innerRadius);
        expect(ring.opacity).toBeGreaterThan(0);
      }
    }
  });

  it("includes each outer ring radius in camera focus calculations", () => {
    expect(planetaryRingOuterRadius("jupiter")).toBeCloseTo(3.11, 3);
    expect(planetaryRingOuterRadius("saturn")).toBe(SATURN_RING_OUTER_RADIUS);
    expect(planetaryRingOuterRadius("uranus")).toBeCloseTo(3.92, 3);
    expect(planetaryRingOuterRadius("neptune")).toBeGreaterThan(2.54);
  });
});
