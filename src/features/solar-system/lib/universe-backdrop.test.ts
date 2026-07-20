import { describe, expect, it } from "vitest";

import { sceneProfileFor } from "./scene-profiles";
import {
  createMilkyWayParticleData,
  universeLayerOpacities,
} from "./universe-backdrop";

describe("distance-aware universe backdrop", () => {
  it("crossfades from local stars to a persistent Milky Way exterior", () => {
    const local = universeLayerOpacities(90, sceneProfileFor("exploration"));
    const galactic = universeLayerOpacities(
      800,
      sceneProfileFor("exploration"),
    );
    const outside = universeLayerOpacities(
      3_000,
      sceneProfileFor("exploration"),
    );

    expect(local.localStars).toBe(1);
    expect(local.milkyWay).toBe(0);
    expect(galactic.localStars).toBe(0);
    expect(galactic.milkyWay).toBeGreaterThan(0.9);
    expect(outside.milkyWay).toBe(1);
  });

  it("uses farther transition distances for the scientific scene", () => {
    expect(
      universeLayerOpacities(800, sceneProfileFor("scientific")).localStars,
    ).toBe(1);
    expect(
      universeLayerOpacities(3_500, sceneProfileFor("scientific")).milkyWay,
    ).toBe(1);
    expect(
      universeLayerOpacities(5_800, sceneProfileFor("scientific")).milkyWay,
    ).toBe(1);
  });

  it("generates deterministic finite galaxy particles", () => {
    const galaxy = createMilkyWayParticleData(20, 7);
    const repeatedGalaxy = createMilkyWayParticleData(20, 7);

    expect(galaxy.positions).toEqual(repeatedGalaxy.positions);
    expect(galaxy.colors).toEqual(repeatedGalaxy.colors);
    expect(galaxy.positions).toHaveLength(60);
    expect([...galaxy.positions, ...galaxy.colors].every(Number.isFinite)).toBe(
      true,
    );
  });

  it("rejects invalid particle counts", () => {
    expect(() => createMilkyWayParticleData(-1)).toThrow(RangeError);
  });
});
