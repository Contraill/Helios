import { describe, expect, it } from "vitest";

import { MISSION_CATALOGUE, MISSION_PLANET_COUNT } from "./mission-catalogue";

describe("mission catalogue", () => {
  it("covers every editorial planet page with unique sourced missions", () => {
    expect(MISSION_PLANET_COUNT).toBe(8);
    expect(MISSION_CATALOGUE.length).toBeGreaterThanOrEqual(9);
    expect(new Set(MISSION_CATALOGUE.map(({ id }) => id)).size).toBe(
      MISSION_CATALOGUE.length,
    );

    for (const mission of MISSION_CATALOGUE) {
      expect(mission.title.length).toBeGreaterThan(0);
      expect(mission.body.length).toBeGreaterThan(40);
      expect(mission.sources.length).toBeGreaterThan(0);
      expect(mission.sources.every(({ url }) => URL.canParse(url))).toBe(true);
    }
  });
});
