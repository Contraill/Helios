import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";
import type { PlanetData, PlanetId } from "@/lib/data/schemas/planet";

import {
  orbitalAngularVelocity,
  orbitalPosition,
  rotationAngularVelocity,
} from "./orbital-motion";

export interface ScenePlanetScale {
  readonly radius: number;
  readonly semiMajorAxis: number;
  readonly semiMinorAxis: number;
  readonly initialPosition: [number, number, number];
}

export interface ScenePlanet {
  readonly id: PlanetId;
  readonly name: string;
  readonly color: string;
  readonly inclinationRadians: number;
  readonly axialTiltRadians: number;
  readonly initialAngle: number;
  readonly orbitalAngularVelocity: number;
  readonly rotationAngularVelocity: number;
  readonly retrogradeRotation: boolean;
  readonly siderealRotationHours: number;
  readonly scales: Readonly<Record<ScaleMode, ScenePlanetScale>>;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const MIN_EXPLORATION_RADIUS = 0.24;

function createScale(
  planet: PlanetData,
  initialAngle: number,
  mode: ScaleMode,
): ScenePlanetScale {
  const strategy = mode === "scientific" ? scientificScale : explorationScale;
  const semiMajorAxis = strategy.distanceFromAu(
    planet.orbit.semiMajorAxisAu.value,
  );
  const semiMinorAxis =
    semiMajorAxis * Math.sqrt(1 - planet.orbit.eccentricity.value ** 2);
  const calculatedRadius = strategy.radiusFromKm(
    planet.physical.meanRadiusKm.value,
  );
  const radius =
    mode === "exploration"
      ? Math.max(MIN_EXPLORATION_RADIUS, calculatedRadius)
      : calculatedRadius;

  return Object.freeze({
    radius,
    semiMajorAxis,
    semiMinorAxis,
    initialPosition: orbitalPosition(
      initialAngle,
      semiMajorAxis,
      semiMinorAxis,
    ),
  });
}

export function sceneScaleFor(
  planet: ScenePlanet,
  mode: ScaleMode,
): ScenePlanetScale {
  return planet.scales[mode];
}

export function createScenePlanets(
  catalog: readonly PlanetData[],
): readonly ScenePlanet[] {
  return Object.freeze(
    catalog.map((planet, index): ScenePlanet => {
      const initialAngle = index * GOLDEN_ANGLE;

      return Object.freeze({
        id: planet.id,
        name: planet.name.en,
        color: planet.accentColor,
        inclinationRadians: (planet.orbit.inclinationDeg.value * Math.PI) / 180,
        axialTiltRadians: (planet.rotation.axialTiltDeg.value * Math.PI) / 180,
        initialAngle,
        orbitalAngularVelocity: orbitalAngularVelocity(
          planet.orbit.orbitalPeriodEarthDays.value,
        ),
        rotationAngularVelocity: rotationAngularVelocity(
          planet.rotation.siderealRotationHours.value,
          planet.rotation.retrograde,
        ),
        retrogradeRotation: planet.rotation.retrograde,
        siderealRotationHours: planet.rotation.siderealRotationHours.value,
        scales: Object.freeze({
          exploration: createScale(planet, initialAngle, "exploration"),
          scientific: createScale(planet, initialAngle, "scientific"),
        }),
      });
    }),
  );
}
