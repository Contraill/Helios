import { describe, expect, it } from "vitest";

import { getPlanetById, planets } from "@/content/planets";

import { createPlanetDetailModel } from "./planet-detail-model";

describe("planet detail model", () => {
  it("builds a sourced Mars view model with Earth-relative calculations", () => {
    const mars = getPlanetById("mars");
    if (!mars) throw new Error("Mars is missing from the catalog.");
    const model = createPlanetDetailModel(mars, planets);

    expect(model.id).toBe("mars");
    expect(model.gravityEarthRatio).toBeCloseTo(0.3783, 4);
    expect(model.dayDifferenceMinutes).toBeCloseTo(39.58, 2);
    expect(model.localDaysPerOrbit).toBeCloseTo(668.6, 2);
    expect(model.previous?.id).toBe("earth");
    expect(model.next?.id).toBe("jupiter");
    expect(model.sources.some(({ id }) => id === "nasa-mars-facts")).toBe(true);
  });
});
