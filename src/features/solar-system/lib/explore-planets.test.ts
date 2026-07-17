import { describe, expect, it } from "vitest";

import { planets } from "@/content/planets";

import { createExplorePlanetSummaries } from "./explore-planets";

const summaries = createExplorePlanetSummaries(planets);

describe("explore planet summaries", () => {
  it("creates a compact ordered summary for all eight planets", () => {
    expect(summaries).toHaveLength(8);
    expect(summaries.map(({ id }) => id)).toEqual(planets.map(({ id }) => id));
  });

  it("keeps all display values finite and positive", () => {
    for (const planet of summaries) {
      expect(planet.gravityMS2).toBeGreaterThan(0);
      expect(planet.orbitalPeriodEarthDays).toBeGreaterThan(0);
      expect(planet.sunlightTravelMinutes).toBeGreaterThan(0);
    }
  });
});
