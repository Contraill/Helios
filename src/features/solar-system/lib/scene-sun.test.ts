import { describe, expect, it } from "vitest";

import { sun } from "@/content/solar-system/sun";
import { planetaryReferenceSourceById } from "@/content/sources/planetary-reference";

import { createSceneSun } from "./scene-sun";

const sceneSun = createSceneSun(sun);

describe("scene Sun", () => {
  it("keeps the scientific radius sourced and smaller than exploration scale", () => {
    expect(sceneSun.scales.scientific).toBeGreaterThan(0);
    expect(sceneSun.scales.scientific).toBeLessThan(
      sceneSun.scales.exploration,
    );
    expect(planetaryReferenceSourceById.has(sceneSun.radiusSourceId)).toBe(
      true,
    );
  });

  it("does not copy the scientific constant into the scene component", () => {
    expect(sceneSun.radiusSourceId).toBe("nasa-sun-fact-sheet");
    expect(sun.physical.meanRadiusKm.value).toBe(695_700);
  });
});
