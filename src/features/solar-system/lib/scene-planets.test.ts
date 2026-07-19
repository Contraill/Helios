import { describe, expect, it } from "vitest";

import { planets } from "@/content/planets";
import { ASTRONOMICAL_UNIT_KM } from "@/lib/calculations/units";

import { createScenePlanets } from "./scene-planets";

const scenePlanets = createScenePlanets(planets);

describe("scene planet catalog", () => {
  it("contains the eight planets in increasing orbital distance in both modes", () => {
    expect(scenePlanets).toHaveLength(8);
    for (const mode of ["exploration", "scientific"] as const) {
      for (let index = 1; index < scenePlanets.length; index += 1) {
        expect(scenePlanets[index].scales[mode].semiMajorAxis).toBeGreaterThan(
          scenePlanets[index - 1].scales[mode].semiMajorAxis,
        );
      }
    }
  });

  it("produces finite render values for every planet and scale mode", () => {
    for (const planet of scenePlanets) {
      for (const mode of ["exploration", "scientific"] as const) {
        const scale = planet.scales[mode];
        expect(scale.radius).toBeGreaterThan(0);
        expect(scale.semiMinorAxis).toBeGreaterThan(0);
        expect(scale.initialPosition.every(Number.isFinite)).toBe(true);
      }
      expect(Number.isFinite(planet.orbitalAngularVelocity)).toBe(true);
      expect(Number.isFinite(planet.rotationAngularVelocity)).toBe(true);
    }
  });

  it("keeps the scientific bodies much smaller than their orbital distances", () => {
    const earth = scenePlanets.find(({ id }) => id === "earth");
    expect(earth).toBeDefined();
    expect(
      earth!.scales.scientific.semiMajorAxis / earth!.scales.scientific.radius,
    ).toBeGreaterThan(20_000);
  });

  it("uses one exact relative scale for scientific radii and orbital distances", () => {
    for (const [index, scenePlanet] of scenePlanets.entries()) {
      const source = planets[index];
      const scale = scenePlanet.scales.scientific;
      const sceneUnitsPerKilometreFromOrbit =
        scale.semiMajorAxis /
        (source.orbit.semiMajorAxisAu.value * ASTRONOMICAL_UNIT_KM);
      const sceneUnitsPerKilometreFromRadius =
        scale.radius / source.physical.meanRadiusKm.value;

      expect(sceneUnitsPerKilometreFromRadius).toBeCloseTo(
        sceneUnitsPerKilometreFromOrbit,
        15,
      );
    }
  });
});
