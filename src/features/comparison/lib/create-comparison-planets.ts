import type { PlanetData } from "@/lib/data/schemas/planet";
import { calculateSunlightTravelTimeMinutes } from "@/lib/calculations/planet";
import type { ComparePlanet } from "@/features/comparison/types/comparison";
import type { Locale } from "@/lib/i18n/locale";

export function createComparisonPlanets(
  planets: readonly PlanetData[],
  locale: Locale = "en",
): readonly ComparePlanet[] {
  return planets.map((planet) => ({
    id: planet.id,
    name: planet.name[locale],
    accentColor: planet.accentColor,
    texturePath: `/textures/planets/${planet.id}.webp`,
    kind: planet.kind,
    radiusKm: planet.physical.meanRadiusKm.value,
    diameterKm: planet.physical.equatorialDiameterKm.value,
    massKg: planet.physical.massKg.value,
    densityKgM3: planet.physical.densityKgM3.value,
    gravityMS2: planet.physical.gravityMS2.value,
    gravityDefinition: planet.physical.gravityMS2.definition,
    semiMajorAxisAu: planet.orbit.semiMajorAxisAu.value,
    orbitalPeriodDays: planet.orbit.orbitalPeriodEarthDays.value,
    siderealRotationHours: planet.rotation.siderealRotationHours.value,
    retrograde: planet.rotation.retrograde,
    ...(planet.rotation.solarDayHours
      ? { solarDayHours: planet.rotation.solarDayHours.value }
      : {}),
    axialTiltDeg: planet.rotation.axialTiltDeg.value,
    temperatureC: planet.environment.temperature.averageC.value,
    temperatureDefinition: planet.environment.temperature.definition,
    atmosphere: planet.environment.atmosphereSummary[locale],
    moonCount: planet.moons.count.value,
    ...(planet.moons.count.asOf
      ? { moonCountAsOf: planet.moons.count.asOf }
      : {}),
    rings: planet.rings.description[locale],
    escapeVelocityKmS: planet.physical.escapeVelocityKmS.value,
    sunlightMinutes: calculateSunlightTravelTimeMinutes(
      planet.orbit.semiMajorAxisKm.value,
    ),
  }));
}
