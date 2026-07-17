import { describe, expect, it } from "vitest";

import {
  planetaryReferenceSourceById,
  planetaryReferenceSources,
} from "@/content/sources/planetary-reference";
import { planetSchema } from "@/lib/data/schemas/planet";

import { collectPlanetSourceIds, getPlanetById, planets } from ".";

function collectNumericLeaves(value: unknown, path = "planet"): string[] {
  if (typeof value === "number") {
    return [path];
  }
  if (value === null || typeof value !== "object") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectNumericLeaves(entry, `${path}[${index}]`),
    );
  }

  const record = value as Record<string, unknown>;
  if (typeof record.value === "number" && typeof record.sourceId === "string") {
    return [];
  }

  return Object.entries(record).flatMap(([key, entry]) =>
    collectNumericLeaves(entry, `${path}.${key}`),
  );
}

describe("planet catalog", () => {
  it("contains the eight planets in order and all pass one schema", () => {
    expect(planets).toHaveLength(8);
    expect(planets.map((planet) => planet.id)).toEqual([
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ]);

    for (const planet of planets) {
      expect(planetSchema.safeParse(planet).success).toBe(true);
    }
  });

  it("rejects a planet with a required field removed", () => {
    const firstPlanet = planets[0];
    expect(firstPlanet).toBeDefined();
    if (!firstPlanet) {
      throw new Error("Planet catalog is unexpectedly empty");
    }

    expect(
      planetSchema.safeParse({ ...firstPlanet, physical: undefined }).success,
    ).toBe(false);
  });

  it("wraps every numeric planet value with provenance", () => {
    for (const planet of planets) {
      expect(collectNumericLeaves(planet)).toEqual([]);
    }
  });

  it("resolves every source id through the registry", () => {
    for (const planet of planets) {
      for (const sourceId of collectPlanetSourceIds(planet)) {
        expect(planetaryReferenceSourceById.has(sourceId)).toBe(true);
      }
    }
  });

  it("keeps source registry ids unique", () => {
    expect(planetaryReferenceSourceById.size).toBe(
      planetaryReferenceSources.length,
    );
  });

  it("dates every moon count", () => {
    for (const planet of planets) {
      expect(planet.moons.count.asOf).toMatch(/^\d{4}-\d{2}(?:-\d{2})?$/);
    }
  });

  it("records the current giant-planet moon snapshot", () => {
    expect(
      Object.fromEntries(
        planets
          .filter((planet) => planet.kind !== "terrestrial")
          .map((planet) => [planet.id, planet.moons.count.value]),
      ),
    ).toEqual({
      jupiter: 115,
      saturn: 293,
      uranus: 29,
      neptune: 16,
    });
  });

  it("does not resolve unknown slugs", () => {
    expect(getPlanetById("pluto")).toBeUndefined();
  });
});
