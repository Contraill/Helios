import { describe, expect, it } from "vitest";

import {
  createDeepFieldParticleData,
  createMilkyWayParticleData,
  universeLayerOpacities,
} from "./universe-backdrop";

describe("distance-aware universe backdrop", () => {
  it("crossfades from local stars to the Milky Way and then deep field", () => {
    const local = universeLayerOpacities(90, "exploration");
    const galactic = universeLayerOpacities(800, "exploration");
    const outside = universeLayerOpacities(3_000, "exploration");

    expect(local.localStars).toBe(1);
    expect(local.milkyWay).toBe(0);
    expect(galactic.localStars).toBe(0);
    expect(galactic.milkyWay).toBeGreaterThan(0.9);
    expect(outside.milkyWay).toBe(0);
    expect(outside.deepField).toBe(1);
  });

  it("uses farther transition distances for the scientific scene", () => {
    expect(universeLayerOpacities(800, "scientific").localStars).toBe(1);
    expect(universeLayerOpacities(3_500, "scientific").milkyWay).toBe(1);
    expect(universeLayerOpacities(11_000, "scientific").deepField).toBe(1);
  });

  it("generates deterministic finite galaxy and deep-field particles", () => {
    const galaxy = createMilkyWayParticleData(20, 7);
    const repeatedGalaxy = createMilkyWayParticleData(20, 7);
    const deepField = createDeepFieldParticleData(12, 9);

    expect(galaxy.positions).toEqual(repeatedGalaxy.positions);
    expect(galaxy.colors).toEqual(repeatedGalaxy.colors);
    expect(galaxy.positions).toHaveLength(60);
    expect(deepField.positions).toHaveLength(36);
    expect(
      [...galaxy.positions, ...galaxy.colors, ...deepField.positions].every(
        Number.isFinite,
      ),
    ).toBe(true);
  });

  it("rejects invalid particle counts", () => {
    expect(() => createMilkyWayParticleData(-1)).toThrow(RangeError);
    expect(() => createDeepFieldParticleData(1.5)).toThrow(RangeError);
  });
});
