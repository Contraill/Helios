import { explorationScale, scientificScale } from "@/lib/calculations/scale";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import {
  MAX_PROPAGATION_DAYS,
  type CartesianVector,
  type EphemerisVector,
} from "./models";

const MILLISECONDS_PER_DAY = 86_400_000;
const SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 = 0.000_295_912_208_285_591_1;

function cross(left: CartesianVector, right: CartesianVector): CartesianVector {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function dot(left: CartesianVector, right: CartesianVector): number {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function magnitude(vector: CartesianVector): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function wrapRadians(angle: number): number {
  return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
}

function solveEccentricAnomaly(
  meanAnomaly: number,
  eccentricity: number,
): number {
  let eccentricAnomaly = meanAnomaly;
  for (let iteration = 0; iteration < 10; iteration += 1) {
    const correction =
      (eccentricAnomaly -
        eccentricity * Math.sin(eccentricAnomaly) -
        meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
    eccentricAnomaly -= correction;
    if (Math.abs(correction) < 1e-12) break;
  }
  return eccentricAnomaly;
}

export function propagatedPositionAu(
  vector: EphemerisVector,
  observedAt: string,
  simulationAtMs: number,
): CartesianVector {
  const rawDays =
    (simulationAtMs - Date.parse(observedAt)) / MILLISECONDS_PER_DAY;
  const days = Math.max(
    -MAX_PROPAGATION_DAYS,
    Math.min(MAX_PROPAGATION_DAYS, rawDays),
  );
  if (days === 0) return vector.positionAu;

  const position = vector.positionAu;
  const velocity = vector.velocityAuPerDay;
  const positionMagnitude = magnitude(position);
  const velocitySquared = dot(velocity, velocity);
  const angularMomentum = cross(position, velocity);
  const angularMomentumMagnitude = magnitude(angularMomentum);
  const node = { x: -angularMomentum.y, y: angularMomentum.x, z: 0 };
  const nodeMagnitude = magnitude(node);
  const eccentricityVectorCross = cross(velocity, angularMomentum);
  const eccentricityVector = {
    x:
      eccentricityVectorCross.x / SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 -
      position.x / positionMagnitude,
    y:
      eccentricityVectorCross.y / SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 -
      position.y / positionMagnitude,
    z:
      eccentricityVectorCross.z / SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 -
      position.z / positionMagnitude,
  };
  const eccentricity = magnitude(eccentricityVector);
  const semiMajorAxis =
    1 /
    (2 / positionMagnitude -
      velocitySquared / SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2);

  if (
    !Number.isFinite(semiMajorAxis) ||
    semiMajorAxis <= 0 ||
    eccentricity >= 1 ||
    eccentricity < 1e-8 ||
    nodeMagnitude < 1e-10
  ) {
    return {
      x: position.x + velocity.x * days,
      y: position.y + velocity.y * days,
      z: position.z + velocity.z * days,
    };
  }

  const inclination = Math.acos(angularMomentum.z / angularMomentumMagnitude);
  const ascendingNode = Math.atan2(node.y, node.x);
  const argumentOfPeriapsis = Math.atan2(
    dot(cross(node, eccentricityVector), angularMomentum) /
      (nodeMagnitude * eccentricity * angularMomentumMagnitude),
    dot(node, eccentricityVector) / (nodeMagnitude * eccentricity),
  );
  const trueAnomaly = Math.atan2(
    dot(cross(eccentricityVector, position), angularMomentum) /
      (eccentricity * positionMagnitude * angularMomentumMagnitude),
    dot(eccentricityVector, position) / (eccentricity * positionMagnitude),
  );
  const initialEccentricAnomaly =
    2 *
    Math.atan2(
      Math.sqrt(1 - eccentricity) * Math.sin(trueAnomaly / 2),
      Math.sqrt(1 + eccentricity) * Math.cos(trueAnomaly / 2),
    );
  const initialMeanAnomaly =
    initialEccentricAnomaly - eccentricity * Math.sin(initialEccentricAnomaly);
  const meanMotion = Math.sqrt(
    SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 / semiMajorAxis ** 3,
  );
  const meanAnomaly = wrapRadians(initialMeanAnomaly + meanMotion * days);
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, eccentricity);
  const perifocalX =
    semiMajorAxis * (Math.cos(eccentricAnomaly) - eccentricity);
  const perifocalY =
    semiMajorAxis *
    Math.sqrt(1 - eccentricity ** 2) *
    Math.sin(eccentricAnomaly);

  const cosNode = Math.cos(ascendingNode);
  const sinNode = Math.sin(ascendingNode);
  const cosPeriapsis = Math.cos(argumentOfPeriapsis);
  const sinPeriapsis = Math.sin(argumentOfPeriapsis);
  const cosInclination = Math.cos(inclination);
  const sinInclination = Math.sin(inclination);
  const basisP = {
    x: cosNode * cosPeriapsis - sinNode * sinPeriapsis * cosInclination,
    y: sinNode * cosPeriapsis + cosNode * sinPeriapsis * cosInclination,
    z: sinPeriapsis * sinInclination,
  };
  const basisQ = {
    x: -cosNode * sinPeriapsis - sinNode * cosPeriapsis * cosInclination,
    y: -sinNode * sinPeriapsis + cosNode * cosPeriapsis * cosInclination,
    z: cosPeriapsis * sinInclination,
  };

  return {
    x: basisP.x * perifocalX + basisQ.x * perifocalY,
    y: basisP.y * perifocalX + basisQ.y * perifocalY,
    z: basisP.z * perifocalX + basisQ.z * perifocalY,
  };
}

export function vectorToScenePosition(
  vector: CartesianVector,
  scaleMode: ScaleMode,
): readonly [number, number, number] {
  const distanceAu = Math.hypot(vector.x, vector.y, vector.z);
  if (distanceAu === 0) return [0, 0, 0];

  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;
  const sceneDistance = strategy.distanceFromAu(distanceAu);
  const factor = sceneDistance / distanceAu;

  // Horizons uses ecliptic X/Y with Z normal to the plane. Three.js uses Y up.
  return [vector.x * factor, vector.z * factor, -vector.y * factor];
}

export function ephemerisScenePosition(
  vector: EphemerisVector,
  observedAt: string,
  simulationAtMs: number,
  scaleMode: ScaleMode,
): readonly [number, number, number] {
  return vectorToScenePosition(
    propagatedPositionAu(vector, observedAt, simulationAtMs),
    scaleMode,
  );
}
