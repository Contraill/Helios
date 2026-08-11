import { describe, expect, it } from "vitest";

import { sceneProfileFor } from "./scene-profiles";
import {
  createMilkyWayDustParticleData,
  createMilkyWayParticleData,
  galacticContextDistance,
  galacticContextPhase,
  galacticContextPhaseWithHysteresis,
  galacticContextReturnDistance,
  galacticContextReturnTargetRadius,
  galacticContextTargetRadius,
  galacticMapRadius,
  galacticMapRadiusForViewport,
  MILKY_WAY_MODEL,
  SOLAR_SYSTEM_GALACTIC_POSITION,
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

  it("labels local, transition and galactic map phases without implying one continuous scale", () => {
    const profile = sceneProfileFor("exploration");
    expect(galacticContextPhase(90, profile)).toBe("local");
    expect(galacticContextPhase(300, profile)).toBe("transition");
    expect(galacticContextPhase(520, profile)).toBe("galactic");
  });

  it("generates deterministic finite galaxy particles", () => {
    const galaxy = createMilkyWayParticleData(20, 7);
    const repeatedGalaxy = createMilkyWayParticleData(20, 7);

    expect(galaxy.positions).toEqual(repeatedGalaxy.positions);
    expect(galaxy.colors).toEqual(repeatedGalaxy.colors);
    expect(galaxy.sizes).toEqual(repeatedGalaxy.sizes);
    expect(galaxy.opacities).toEqual(repeatedGalaxy.opacities);
    expect(galaxy.positions).toHaveLength(60);
    expect(galaxy.sizes).toHaveLength(20);
    expect(
      [
        ...galaxy.positions,
        ...galaxy.colors,
        ...galaxy.sizes,
        ...galaxy.opacities,
      ].every(Number.isFinite),
    ).toBe(true);
  });

  it("rejects invalid particle counts", () => {
    expect(() => createMilkyWayParticleData(-1)).toThrow(RangeError);
    expect(() => createMilkyWayDustParticleData(-1)).toThrow(RangeError);
  });

  it("models the barred Milky Way and places the Solar System in the Orion Spur", () => {
    expect(MILKY_WAY_MODEL).toMatchObject({
      majorArmCount: 2,
      minorArmCount: 2,
      solarDistanceLightYears: 26_000,
      solarNeighbourhood: "Orion Spur",
    });
    expect(Math.hypot(...SOLAR_SYSTEM_GALACTIC_POSITION)).toBeCloseTo(
      MILKY_WAY_MODEL.solarRadiusRatio,
      3,
    );
    expect(Math.hypot(...SOLAR_SYSTEM_GALACTIC_POSITION)).toBeGreaterThan(0.5);
  });

  it("does not trigger galactic context while a distant body is selected or targeted", () => {
    const profile = sceneProfileFor("scientific");
    const remoteFocus = {
      cameraMode: "focus",
      cameraPosition: [4_200, 40, 80] as const,
      cameraTarget: [4_100, 0, 0] as const,
      selectedBodyId: "sedna",
    };
    expect(galacticContextDistance(remoteFocus, profile)).toBe(0);
    expect(
      galacticContextDistance(
        {
          ...remoteFocus,
          cameraMode: "free",
          selectedBodyId: null,
        },
        profile,
      ),
    ).toBe(0);
    expect(
      galacticContextDistance(
        {
          cameraMode: "overview",
          cameraPosition: [0, 1_800, 3_200],
          cameraTarget: [0, 0, 0],
          selectedBodyId: null,
        },
        profile,
      ),
    ).toBeGreaterThan(2_900);
  });

  it("accepts small mobile pinch drift while rejecting remote free-camera targets", () => {
    const profile = sceneProfileFor("exploration");
    expect(
      galacticContextDistance(
        {
          cameraMode: "free",
          cameraPosition: [0, 360, 520],
          cameraTarget: [38, 4, 0],
          selectedBodyId: null,
        },
        profile,
      ),
    ).toBeGreaterThan(profile.backdrop.milkyWayFadeIn[0]);
    expect(
      galacticContextDistance(
        {
          cameraMode: "free",
          cameraPosition: [4_200, 40, 80],
          cameraTarget: [4_100, 0, 0],
          selectedBodyId: null,
        },
        sceneProfileFor("scientific"),
      ),
    ).toBe(0);
  });

  it("keeps portrait galactic framing closer to the Solar System origin", () => {
    const profile = sceneProfileFor("exploration");
    const portrait = galacticContextTargetRadius(700, profile, 390 / 844);
    const landscape = galacticContextTargetRadius(700, profile, 844 / 390);
    expect(portrait).toBeLessThan(landscape);
    expect(portrait).toBeGreaterThanOrEqual(
      profile.backdrop.milkyWayFadeIn[0] * 0.12,
    );
  });

  it("eases pinch drift back to the origin before local panning resumes", () => {
    const profile = sceneProfileFor("exploration");
    const far = galacticContextReturnTargetRadius(520, profile, 390 / 844);
    const transition = galacticContextReturnTargetRadius(
      140,
      profile,
      390 / 844,
    );
    const local = galacticContextReturnTargetRadius(70, profile, 390 / 844);
    expect(far).toBeGreaterThan(transition);
    expect(transition).toBeGreaterThan(local);
    expect(local).toBe(0);
  });

  it("smooths target return monotonically without pushing safe targets outward", () => {
    const first = galacticContextReturnDistance(80, 10, 1 / 60);
    const second = galacticContextReturnDistance(first, 10, 1 / 60);
    expect(first).toBeLessThan(80);
    expect(first).toBeGreaterThan(10);
    expect(second).toBeLessThan(first);
    expect(galacticContextReturnDistance(8, 10, 1 / 60)).toBe(8);
    expect(galacticContextReturnDistance(80, 10, 0)).toBe(80);
    expect(galacticContextReturnDistance(80, 10, 1)).toBeGreaterThan(10);
  });

  it("uses hysteresis so pinch jitter does not rapidly hide the galaxy", () => {
    const profile = sceneProfileFor("exploration");
    expect(galacticContextPhaseWithHysteresis(470, profile, "galactic")).toBe(
      "galactic",
    );
    expect(galacticContextPhaseWithHysteresis(390, profile, "galactic")).toBe(
      "transition",
    );
    expect(galacticContextPhaseWithHysteresis(215, profile, "transition")).toBe(
      "local",
    );
  });

  it("fits the galaxy map inside portrait horizontal field of view", () => {
    const profile = sceneProfileFor("exploration");
    const distance = 700;
    const portrait = galacticMapRadiusForViewport(
      distance,
      profile,
      390 / 844,
      46,
    );
    const landscape = galacticMapRadiusForViewport(
      distance,
      profile,
      844 / 390,
      46,
    );
    expect(portrait).toBeLessThan(landscape);
    expect(portrait).toBeGreaterThan(0);
    expect(portrait).toBeLessThan(galacticMapRadius(distance, profile));
  });

  it("keeps the exterior galaxy map in front of the camera instead of surrounding it", () => {
    const profile = sceneProfileFor("scientific");
    for (const distance of [1_300, 2_900, 5_800]) {
      expect(galacticMapRadius(distance, profile)).toBeLessThan(distance);
    }
  });
});
