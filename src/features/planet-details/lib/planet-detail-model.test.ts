import { describe, expect, it } from "vitest";

import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planets } from "@/content/planets";

import { createPlanetDetailModel } from "./planet-detail-model";

describe("planet detail model", () => {
  it("builds a sourced Mars view model with Earth-relative calculations", () => {
    const mars = getPlanetById("mars");
    if (!mars) throw new Error("Mars is missing from the catalog.");
    const content = getPlanetDetailContent("mars");
    const model = createPlanetDetailModel(mars, planets, content.sourceIds);

    expect(model.id).toBe("mars");
    expect(model.gravityEarthRatio).toBeCloseTo(0.3783, 4);
    expect(model.dayDifferenceMinutes).toBeCloseTo(39.58, 2);
    expect(model.localDaysPerOrbit).toBeCloseTo(668.6, 2);
    expect(model.previous?.id).toBe("earth");
    expect(model.next?.id).toBe("jupiter");
    expect(model.sources.some(({ id }) => id === "nasa-mars-facts")).toBe(true);
    expect(
      model.sources.some(({ id }) => id === "nasa-perseverance-mission"),
    ).toBe(true);
  });

  it("creates finite, sourced models for all eight planets", () => {
    for (const planet of planets) {
      const content = getPlanetDetailContent(planet.id);
      const model = createPlanetDetailModel(planet, planets, content.sourceIds);

      for (const value of [
        model.averageTemperatureC,
        model.axialTiltDeg,
        model.densityKgM3,
        model.equatorialDiameterKm,
        model.escapeVelocityKmS,
        model.gravityEarthRatio,
        model.gravityMS2,
        model.meanRadiusKm,
        model.moonCount,
        model.orbitalPeriodEarthDays,
        model.siderealRotationHours,
        model.sunlightTravelMinutes,
      ]) {
        expect(
          Number.isFinite(value),
          `${planet.id} has a non-finite value`,
        ).toBe(true);
      }

      expect(model.sources.length).toBeGreaterThan(0);
      expect(model.temperatureDefinition).toBe(
        planet.environment.temperature.definition,
      );
      expect(model.gravityDefinition).toBe(
        planet.physical.gravityMS2.definition,
      );
    }
  });

  it("preserves ordered previous and next navigation at the catalog edges", () => {
    const mercury = createPlanetDetailModel(planets[0], planets);
    const neptune = createPlanetDetailModel(planets.at(-1)!, planets);

    expect(mercury.previous).toBeUndefined();
    expect(mercury.next?.id).toBe("venus");
    expect(neptune.previous?.id).toBe("uranus");
    expect(neptune.next).toBeUndefined();
  });

  it("describes giant-planet reference levels instead of a solid surface", () => {
    for (const id of ["jupiter", "saturn", "uranus", "neptune"] as const) {
      const planet = getPlanetById(id);
      if (!planet) throw new Error(`${id} is missing from the catalog.`);
      const model = createPlanetDetailModel(planet, planets);

      expect(model.temperatureDefinition).toBe("reference-level");
      expect(model.gravityDefinition).toBe("one-bar-reference-level");
    }
  });
});
