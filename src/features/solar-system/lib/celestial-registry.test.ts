import { describe, expect, it } from "vitest";

import type { ExplorePlanetSummary } from "./explore-planets";
import type { SceneSun } from "./scene-sun";
import {
  createCelestialRegistry,
  entriesForCategory,
} from "./celestial-registry";

const sun: SceneSun = {
  id: "sun",
  name: "Sun",
  radiusSourceId: "nasa-sun-fact-sheet",
  scales: { exploration: 2.5, scientific: 0.01 },
};
const earth: ExplorePlanetSummary = {
  accentColor: "#4D8BD6",
  gravityMS2: 9.8,
  id: "earth",
  kind: "terrestrial",
  moonCount: 1,
  moonCountAsOf: "2026-07-17",
  name: "Earth",
  orbitalPeriodEarthDays: 365.25,
  orderFromSun: 3,
  sunlightTravelMinutes: 8.3,
  tagline: "The reference world.",
};

describe("celestial metadata registry", () => {
  it("provides category, scene, orbit, summary and source metadata from one entry", () => {
    const registry = createCelestialRegistry([earth], sun);
    expect(registry.get("earth")).toMatchObject({
      displayName: "Earth",
      kind: "planet",
      navigatorCategory: "sun-planets",
      orbitPolicyClass: "planet-orbit",
      sceneRepresentation: "physical-surface",
    });
    expect(registry.get("moon-earth-moon")).toMatchObject({
      displayName: "Moon",
      kind: "moon",
      navigatorCategory: "planetary-moons",
      parentId: "earth",
      orbitPolicyClass: "moon-orbit",
    });
    expect(registry.get("asteroid-belt")).toMatchObject({
      kind: "region",
      orbitPolicyClass: "no-individual-orbit",
      sceneRepresentation: "regional-context",
    });
  });

  it("derives comet and region navigator lists from the same registry", () => {
    const registry = createCelestialRegistry([earth], sun);
    expect(
      entriesForCategory(registry, "comets").every(
        (entry) => entry.kind === "comet",
      ),
    ).toBe(true);
    expect(
      entriesForCategory(registry, "regions-context").map((entry) => entry.id),
    ).toEqual(["asteroid-belt", "kuiper-belt", "oort-cloud", "heliosphere"]);
  });
});
