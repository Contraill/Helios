import { calculateSunlightTravelTimeMinutes } from "@/lib/calculations/planet";
import type { PlanetData, PlanetId } from "@/lib/data/schemas/planet";

export interface ExplorePlanetSummary {
  readonly accentColor: string;
  readonly gravityMS2: number;
  readonly id: PlanetId;
  readonly kind: PlanetData["kind"];
  readonly moonCount: number;
  readonly moonCountAsOf: string;
  readonly name: string;
  readonly orbitalPeriodEarthDays: number;
  readonly orderFromSun: number;
  readonly sunlightTravelMinutes: number;
  readonly tagline: string;
}

export function createExplorePlanetSummaries(
  catalog: readonly PlanetData[],
): readonly ExplorePlanetSummary[] {
  return Object.freeze(
    catalog.map((planet) =>
      Object.freeze({
        accentColor: planet.accentColor,
        gravityMS2: planet.physical.gravityMS2.value,
        id: planet.id,
        kind: planet.kind,
        moonCount: planet.moons.count.value,
        moonCountAsOf: planet.moons.count.asOf ?? "source date unavailable",
        name: planet.name.en,
        orbitalPeriodEarthDays: planet.orbit.orbitalPeriodEarthDays.value,
        orderFromSun: planet.orderFromSun.value,
        sunlightTravelMinutes: calculateSunlightTravelTimeMinutes(
          planet.orbit.semiMajorAxisKm.value,
        ),
        tagline: planet.tagline.en,
      }),
    ),
  );
}
