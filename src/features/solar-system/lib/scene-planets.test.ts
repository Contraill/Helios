import { describe, expect, it } from "vitest";

import { planets } from "@/content/planets";

import { createScenePlanets } from "./scene-planets";

const scenePlanets = createScenePlanets(planets);

describe("scene planet catalog", () => {
  it("contains the eight planets in increasing orbital distance", () => {
    expect(scenePlanets).toHaveLength(8);
    for (let index = 1; index < scenePlanets.length; index += 1) {
      expect(scenePlanets[index].semiMajorAxis).toBeGreaterThan(
        scenePlanets[index - 1].semiMajorAxis,
      );
    }
  });

  it("produces finite render values for every planet", () => {
    for (const planet of scenePlanets) {
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.semiMinorAxis).toBeGreaterThan(0);
      expect(planet.initialPosition.every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(planet.orbitalAngularVelocity)).toBe(true);
      expect(Number.isFinite(planet.rotationAngularVelocity)).toBe(true);
    }
  });
});
