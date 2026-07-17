import { collectPlanetSourceIds } from "@/content/planets";
import { createSourcePresentations } from "@/features/data-presentation/lib/source-presentation";
import type { SourcePresentation } from "@/features/data-presentation/types/presentation";
import {
  calculateDayLengthDifferenceMinutes,
  calculateLocalDaysPerOrbit,
  calculateRatio,
} from "@/lib/calculations/comparison";
import {
  calculateSunlightTravelTimeMinutes,
  STANDARD_EARTH_GRAVITY_MS2,
} from "@/lib/calculations/planet";
import type { PlanetData, PlanetId } from "@/lib/data/schemas/planet";

export interface PlanetDetailModel {
  readonly accentColor: string;
  readonly atmosphereComponents: readonly string[];
  readonly atmosphereSummary: string;
  readonly averageTemperatureC: number;
  readonly axialTiltDeg: number;
  readonly dayDifferenceMinutes?: number;
  readonly densityKgM3: number;
  readonly description: string;
  readonly equatorialDiameterKm: number;
  readonly escapeVelocityKmS: number;
  readonly featuredMoons: readonly string[];
  readonly gravityDefinition: PlanetData["physical"]["gravityMS2"]["definition"];
  readonly gravityEarthRatio: number;
  readonly gravityMS2: number;
  readonly hasRings: boolean;
  readonly id: PlanetId;
  readonly kind: PlanetData["kind"];
  readonly localDaysPerOrbit?: number;
  readonly meanRadiusKm: number;
  readonly moonCount: number;
  readonly moonCountAsOf?: string;
  readonly name: string;
  readonly next?: { readonly id: PlanetId; readonly name: string };
  readonly orbitalPeriodEarthDays: number;
  readonly orderFromSun: number;
  readonly previous?: { readonly id: PlanetId; readonly name: string };
  readonly retrograde: boolean;
  readonly ringsDescription: string;
  readonly siderealRotationHours: number;
  readonly solarDayHours?: number;
  readonly sources: readonly SourcePresentation[];
  readonly sunlightTravelMinutes: number;
  readonly tagline: string;
  readonly temperatureDefinition: PlanetData["environment"]["temperature"]["definition"];
}

export function createPlanetDetailModel(
  planet: PlanetData,
  catalog: readonly PlanetData[],
  additionalSourceIds: readonly string[] = [],
): PlanetDetailModel {
  const index = catalog.findIndex(({ id }) => id === planet.id);
  if (index < 0) throw new Error(`Planet ${planet.id} is not in the catalog.`);

  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const solarDayHours = planet.rotation.solarDayHours?.value;
  const sourceIds = [...collectPlanetSourceIds(planet), ...additionalSourceIds];

  return Object.freeze({
    accentColor: planet.accentColor,
    atmosphereComponents: Object.freeze([
      ...planet.environment.majorAtmosphericComponents,
    ]),
    atmosphereSummary: planet.environment.atmosphereSummary.en,
    averageTemperatureC: planet.environment.temperature.averageC.value,
    axialTiltDeg: planet.rotation.axialTiltDeg.value,
    ...(solarDayHours
      ? {
          dayDifferenceMinutes:
            calculateDayLengthDifferenceMinutes(solarDayHours),
          localDaysPerOrbit: calculateLocalDaysPerOrbit(
            planet.orbit.orbitalPeriodEarthDays.value,
            solarDayHours,
          ),
          solarDayHours,
        }
      : {}),
    densityKgM3: planet.physical.densityKgM3.value,
    description: planet.description.en,
    equatorialDiameterKm: planet.physical.equatorialDiameterKm.value,
    escapeVelocityKmS: planet.physical.escapeVelocityKmS.value,
    featuredMoons: Object.freeze([...planet.moons.featured]),
    gravityDefinition: planet.physical.gravityMS2.definition,
    gravityEarthRatio: calculateRatio(
      planet.physical.gravityMS2.value,
      STANDARD_EARTH_GRAVITY_MS2,
    ),
    gravityMS2: planet.physical.gravityMS2.value,
    hasRings: planet.rings.hasRings,
    id: planet.id,
    kind: planet.kind,
    meanRadiusKm: planet.physical.meanRadiusKm.value,
    moonCount: planet.moons.count.value,
    ...(planet.moons.count.asOf
      ? { moonCountAsOf: planet.moons.count.asOf }
      : {}),
    name: planet.name.en,
    ...(next ? { next: { id: next.id, name: next.name.en } } : {}),
    orbitalPeriodEarthDays: planet.orbit.orbitalPeriodEarthDays.value,
    orderFromSun: planet.orderFromSun.value,
    ...(previous
      ? { previous: { id: previous.id, name: previous.name.en } }
      : {}),
    retrograde: planet.rotation.retrograde,
    ringsDescription: planet.rings.description.en,
    siderealRotationHours: planet.rotation.siderealRotationHours.value,
    sources: createSourcePresentations(sourceIds),
    sunlightTravelMinutes: calculateSunlightTravelTimeMinutes(
      planet.orbit.semiMajorAxisKm.value,
    ),
    tagline: planet.tagline.en,
    temperatureDefinition: planet.environment.temperature.definition,
  });
}
