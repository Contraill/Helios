import { explorationScale } from "@/lib/calculations/scale";
import type { PlanetData, PlanetId } from "@/lib/data/schemas/planet";

import {
  orbitalAngularVelocity,
  orbitalPosition,
  rotationAngularVelocity,
} from "./orbital-motion";

export interface ScenePlanet {
  readonly id: PlanetId;
  readonly name: string;
  readonly color: string;
  readonly radius: number;
  readonly semiMajorAxis: number;
  readonly semiMinorAxis: number;
  readonly inclinationRadians: number;
  readonly axialTiltRadians: number;
  readonly initialAngle: number;
  readonly initialPosition: [number, number, number];
  readonly orbitalAngularVelocity: number;
  readonly rotationAngularVelocity: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const MIN_RENDER_RADIUS = 0.24;

export function createScenePlanets(
  catalog: readonly PlanetData[],
): readonly ScenePlanet[] {
  return Object.freeze(
    catalog.map((planet, index): ScenePlanet => {
      const semiMajorAxis = explorationScale.distanceFromAu(
        planet.orbit.semiMajorAxisAu.value,
      );
      const semiMinorAxis =
        semiMajorAxis * Math.sqrt(1 - planet.orbit.eccentricity.value ** 2);
      const initialAngle = index * GOLDEN_ANGLE;

      return Object.freeze({
        id: planet.id,
        name: planet.name.en,
        color: planet.accentColor,
        radius: Math.max(
          MIN_RENDER_RADIUS,
          explorationScale.radiusFromKm(planet.physical.meanRadiusKm.value),
        ),
        semiMajorAxis,
        semiMinorAxis,
        inclinationRadians: (planet.orbit.inclinationDeg.value * Math.PI) / 180,
        axialTiltRadians: (planet.rotation.axialTiltDeg.value * Math.PI) / 180,
        initialAngle,
        initialPosition: orbitalPosition(
          initialAngle,
          semiMajorAxis,
          semiMinorAxis,
        ),
        orbitalAngularVelocity: orbitalAngularVelocity(
          planet.orbit.orbitalPeriodEarthDays.value,
        ),
        rotationAngularVelocity: rotationAngularVelocity(
          planet.rotation.siderealRotationHours.value,
          planet.rotation.retrograde,
        ),
      });
    }),
  );
}
