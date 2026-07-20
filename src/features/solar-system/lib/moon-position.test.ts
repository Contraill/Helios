import { describe, expect, it } from "vitest";

import { FEATURED_MOONS, MOON_BY_ID, moonSchema } from "./moon-catalogue";
import {
  moonLocalPositionAt,
  moonOrbitDistanceScene,
  moonPhysicalRadiusScene,
} from "./moon-position";

describe("featured moon domain and position evaluation", () => {
  it("validates the full requested featured set and parent relations", () => {
    expect(FEATURED_MOONS).toHaveLength(22);
    for (const moon of FEATURED_MOONS) {
      expect(() => moonSchema.parse(moon)).not.toThrow();
      expect(moon.id).toContain(moon.parentPlanetId);
      expect(moon.sourceIds).toContain("jpl-planetary-satellite-mean-elements");
      expect(moon.representation.representationType).toBe(
        "representative-mean-elements",
      );
    }
  });

  it("returns the same local position for pause/reset-equivalent timestamps", () => {
    const europa = MOON_BY_ID["moon-jupiter-europa"];
    const at = Date.parse("2026-07-19T00:00:00.000Z");
    expect(moonLocalPositionAt(europa, at, 4.2)).toEqual(
      moonLocalPositionAt(europa, at, 4.2),
    );
    expect(moonLocalPositionAt(europa, at + 86_400_000, 4.2)).not.toEqual(
      moonLocalPositionAt(europa, at, 4.2),
    );
  });

  it("separates the scientific physical radius from the visibility marker", () => {
    const phobos = MOON_BY_ID["moon-mars-phobos"];
    const physical = moonPhysicalRadiusScene(phobos, 1, 3389.5);
    const orbit = moonOrbitDistanceScene(phobos, 1, 3389.5, "scientific");
    expect(physical).toBeCloseTo(phobos.meanRadiusKm / 3389.5, 10);
    expect(orbit).toBeCloseTo(phobos.semiMajorAxisKm / 3389.5, 10);
    expect(physical).toBeLessThan(orbit);
  });
});
