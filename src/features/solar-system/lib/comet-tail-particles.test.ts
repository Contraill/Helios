import { describe, expect, it } from "vitest";

import {
  buildComaParticles,
  buildCometTailParticles,
} from "./comet-tail-particles";

describe("comet particle volumes", () => {
  it("builds deterministic, tapered dust and ion populations", () => {
    const dustA = buildCometTailParticles({
      bodyId: "67p",
      kind: "dust",
      length: 4,
      width: 0.8,
      count: 420,
    });
    const dustB = buildCometTailParticles({
      bodyId: "67p",
      kind: "dust",
      length: 4,
      width: 0.8,
      count: 420,
    });
    const ion = buildCometTailParticles({
      bodyId: "67p",
      kind: "ion",
      length: 5,
      width: 0.4,
      count: 220,
    });

    expect(dustA.count).toBe(420);
    expect(ion.count).toBe(220);
    expect(dustA.signature).toBe(dustB.signature);
    expect(Array.from(dustA.positions)).toEqual(Array.from(dustB.positions));
    expect(dustA.signature).not.toBe(ion.signature);
    expect(
      Math.min(...dustA.positions.filter((_, index) => index % 3 === 1)),
    ).toBeLessThan(-3.7);
    expect(Math.max(...dustA.opacities)).toBeGreaterThan(
      Math.min(...dustA.opacities),
    );
  });

  it("keeps ion particles narrower than dust for the same profile width", () => {
    const dust = buildCometTailParticles({
      bodyId: "halley",
      kind: "dust",
      length: 4,
      width: 0.8,
      count: 520,
    });
    const ion = buildCometTailParticles({
      bodyId: "halley",
      kind: "ion",
      length: 4,
      width: 0.8,
      count: 520,
    });
    const radialExtent = (positions: Float32Array) => {
      let maximum = 0;
      for (let index = 0; index < positions.length; index += 3) {
        maximum = Math.max(
          maximum,
          Math.hypot(positions[index] ?? 0, positions[index + 2] ?? 0),
        );
      }
      return maximum;
    };

    expect(radialExtent(ion.positions)).toBeLessThan(
      radialExtent(dust.positions) * 0.55,
    );
  });

  it("builds a soft coma without a hard shell", () => {
    const coma = buildComaParticles({
      bodyId: "neowise",
      extent: 0.7,
      count: 180,
    });
    expect(coma.count).toBe(180);
    expect(Math.max(...coma.opacities)).toBeGreaterThan(0.75);
    expect(Math.min(...coma.opacities)).toBeLessThan(0.2);
    expect(new Set(coma.sizes).size).toBeGreaterThan(100);
  });
});
