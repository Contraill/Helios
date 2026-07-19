import { describe, expect, it } from "vitest";

import { PLANETARY_RING_PROFILES } from "./planetary-rings";

describe("giant-planet ring profiles", () => {
  it("models Jupiter as a faint halo, main ring and two gossamer regions", () => {
    expect(PLANETARY_RING_PROFILES.jupiter.bands.map(({ id }) => id)).toEqual([
      "halo",
      "main",
      "amalthea-gossamer",
      "thebe-gossamer",
    ]);
    expect(PLANETARY_RING_PROFILES.jupiter.bands[1].outerRadius).toBeCloseTo(
      1.806,
      3,
    );
  });

  it("keeps all 13 named Uranian rings in increasing radial order", () => {
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
  });

  it("models Neptune's five main rings and four Adams-ring arcs", () => {
    expect(PLANETARY_RING_PROFILES.neptune.bands).toHaveLength(5);
    expect(PLANETARY_RING_PROFILES.neptune.arcs).toHaveLength(4);
    expect(PLANETARY_RING_PROFILES.neptune.bands.at(-1)?.id).toBe("adams");
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
});
