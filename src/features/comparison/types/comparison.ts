import type { PlanetId } from "@/lib/data/schemas/planet";

export interface ComparePlanet {
  readonly id: PlanetId;
  readonly name: string;
  readonly accentColor: string;
  readonly kind: "terrestrial" | "gas-giant" | "ice-giant";
  readonly radiusKm: number;
  readonly diameterKm: number;
  readonly massKg: number;
  readonly densityKgM3: number;
  readonly gravityMS2: number;
  readonly gravityDefinition: "surface-equatorial" | "one-bar-reference-level";
  readonly semiMajorAxisAu: number;
  readonly orbitalPeriodDays: number;
  readonly siderealRotationHours: number;
  readonly solarDayHours?: number;
  readonly axialTiltDeg: number;
  readonly temperatureC: number;
  readonly temperatureDefinition:
    "surface" | "cloud-top" | "reference-level" | "not-applicable";
  readonly atmosphere: string;
  readonly moonCount: number;
  readonly moonCountAsOf?: string;
  readonly rings: string;
  readonly escapeVelocityKmS: number;
  readonly sunlightMinutes: number;
}
