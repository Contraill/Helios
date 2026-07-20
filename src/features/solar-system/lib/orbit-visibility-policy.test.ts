import { describe, expect, it } from "vitest";

import { EXTENDED_BODIES } from "./extended-system";
import { MOON_BY_ID } from "./moon-catalogue";
import {
  backgroundLayerHasIndividualOrbit,
  extendedBodyOrbitVisibility,
  moonOrbitVisibility,
  planetOrbitVisibility,
} from "./orbit-visibility-policy";

const base = {
  navigatorView: { kind: "categories" } as const,
  orbitsVisible: true,
  selectedBodyId: null,
  hoveredBodyId: null,
};

describe("orbit visibility policy", () => {
  it("keeps all eight planetary orbits available when the global toggle is on", () => {
    for (const id of [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ] as const) {
      expect(planetOrbitVisibility(id, base)).toBe("context");
    }
  });

  it("shows every modelled comet orbit together in the Comets category", () => {
    const context = {
      ...base,
      navigatorView: { kind: "category", category: "comets" } as const,
    };
    const comets = EXTENDED_BODIES.filter((body) => body.kind === "comet");
    expect(comets.length).toBeGreaterThan(1);
    expect(
      comets.map((body) => extendedBodyOrbitVisibility(body, context)),
    ).toEqual(comets.map(() => "context"));
  });

  it("limits moon orbits to the active parent system and never adds background particle orbits", () => {
    const context = {
      ...base,
      navigatorView: { kind: "moons", parentPlanetId: "jupiter" } as const,
    };
    expect(
      moonOrbitVisibility(MOON_BY_ID["moon-jupiter-europa"], context),
    ).toBe("context");
    expect(moonOrbitVisibility(MOON_BY_ID["moon-saturn-titan"], context)).toBe(
      "hidden",
    );
    expect(backgroundLayerHasIndividualOrbit()).toBe(false);
  });

  it("keeps the selected extended orbit mounted outside its navigator category", () => {
    const ceres = EXTENDED_BODIES.find((body) => body.id === "ceres");
    expect(ceres).toBeDefined();
    expect(
      extendedBodyOrbitVisibility(ceres!, {
        ...base,
        navigatorView: {
          kind: "category",
          category: "regions-context",
        } as const,
        selectedBodyId: "ceres",
      }),
    ).toBe("selected");
  });
});
