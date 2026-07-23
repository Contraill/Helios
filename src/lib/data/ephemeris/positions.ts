import { explorationScale, scientificScale } from "@/lib/calculations/scale";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import {
  normalizeRadiansSigned,
  solveEllipticKepler,
} from "@/features/solar-system/lib/elliptic-orbit-evaluator";
import { resampleClosedOrbitByArcLength } from "@/features/solar-system/lib/orbit-path-resampling";

import {
  MAX_PROPAGATION_DAYS,
  type CartesianVector,
  type EphemerisVector,
  type EphemerisWindow,
} from "./models";

const MILLISECONDS_PER_DAY = 86_400_000;
const SOLAR_GRAVITATIONAL_PARAMETER_AU3_PER_DAY2 = 0.000_295_912_208_285_591_1;

interface OsculatingOrbit {
  readonly basisP: CartesianVector;
  readonly basisQ: CartesianVector;
  readonly eccentricity: number;
  readonly initialMeanAnomaly: number;
  readonly meanMotion: number;
  readonly semiMajorAxis: number;
}

export type MutableScenePosition = [number, number, number];

export type EphemerisScenePositionEvaluator = (
  simulationAtMs: number,
  target: MutableScenePosition,
) => MutableScenePosition;

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

function osculatingOrbitFor(vector: EphemerisVector): OsculatingOrbit | null {
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
    nodeMagnitude < 1e-10 ||
    angularMomentumMagnitude < 1e-12
  ) {
    return null;
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
  const cosNode = Math.cos(ascendingNode);
  const sinNode = Math.sin(ascendingNode);
  const cosPeriapsis = Math.cos(argumentOfPeriapsis);
  const sinPeriapsis = Math.sin(argumentOfPeriapsis);
  const cosInclination = Math.cos(inclination);
  const sinInclination = Math.sin(inclination);

  return {
    semiMajorAxis,
    eccentricity,
    initialMeanAnomaly,
    meanMotion,
    basisP: {
      x: cosNode * cosPeriapsis - sinNode * sinPeriapsis * cosInclination,
      y: sinNode * cosPeriapsis + cosNode * sinPeriapsis * cosInclination,
      z: sinPeriapsis * sinInclination,
    },
    basisQ: {
      x: -cosNode * sinPeriapsis - sinNode * cosPeriapsis * cosInclination,
      y: -sinNode * sinPeriapsis + cosNode * cosPeriapsis * cosInclination,
      z: cosPeriapsis * sinInclination,
    },
  };
}

function positionOnOrbit(
  orbit: OsculatingOrbit,
  days: number,
): CartesianVector {
  const meanAnomaly = normalizeRadiansSigned(
    orbit.initialMeanAnomaly + orbit.meanMotion * days,
  );
  const eccentricAnomaly = solveEllipticKepler(
    meanAnomaly,
    orbit.eccentricity,
  ).eccentricAnomalyRadians;
  const perifocalX =
    orbit.semiMajorAxis * (Math.cos(eccentricAnomaly) - orbit.eccentricity);
  const perifocalY =
    orbit.semiMajorAxis *
    Math.sqrt(1 - orbit.eccentricity ** 2) *
    Math.sin(eccentricAnomaly);

  return {
    x: orbit.basisP.x * perifocalX + orbit.basisQ.x * perifocalY,
    y: orbit.basisP.y * perifocalX + orbit.basisQ.y * perifocalY,
    z: orbit.basisP.z * perifocalX + orbit.basisQ.z * perifocalY,
  };
}

function positionOnOrbitAtEccentricAnomaly(
  orbit: OsculatingOrbit,
  eccentricAnomaly: number,
): CartesianVector {
  const perifocalX =
    orbit.semiMajorAxis * (Math.cos(eccentricAnomaly) - orbit.eccentricity);
  const perifocalY =
    orbit.semiMajorAxis *
    Math.sqrt(1 - orbit.eccentricity ** 2) *
    Math.sin(eccentricAnomaly);
  return {
    x: orbit.basisP.x * perifocalX + orbit.basisQ.x * perifocalY,
    y: orbit.basisP.y * perifocalX + orbit.basisQ.y * perifocalY,
    z: orbit.basisP.z * perifocalX + orbit.basisQ.z * perifocalY,
  };
}

function positionAfterDays(
  vector: EphemerisVector,
  days: number,
  orbit = osculatingOrbitFor(vector),
): CartesianVector {
  if (days === 0) return vector.positionAu;
  if (orbit) return positionOnOrbit(orbit, days);
  return {
    x: vector.positionAu.x + vector.velocityAuPerDay.x * days,
    y: vector.positionAu.y + vector.velocityAuPerDay.y * days,
    z: vector.positionAu.z + vector.velocityAuPerDay.z * days,
  };
}

function writePositionAfterDays(
  target: MutableScenePosition,
  vector: EphemerisVector,
  days: number,
  orbit: OsculatingOrbit | null,
): MutableScenePosition {
  if (days === 0) {
    target[0] = vector.positionAu.x;
    target[1] = vector.positionAu.y;
    target[2] = vector.positionAu.z;
    return target;
  }
  if (orbit) {
    const meanAnomaly = normalizeRadiansSigned(
      orbit.initialMeanAnomaly + orbit.meanMotion * days,
    );
    const eccentricAnomaly = solveEllipticKepler(
      meanAnomaly,
      orbit.eccentricity,
    ).eccentricAnomalyRadians;
    const perifocalX =
      orbit.semiMajorAxis * (Math.cos(eccentricAnomaly) - orbit.eccentricity);
    const perifocalY =
      orbit.semiMajorAxis *
      Math.sqrt(1 - orbit.eccentricity ** 2) *
      Math.sin(eccentricAnomaly);
    target[0] = orbit.basisP.x * perifocalX + orbit.basisQ.x * perifocalY;
    target[1] = orbit.basisP.y * perifocalX + orbit.basisQ.y * perifocalY;
    target[2] = orbit.basisP.z * perifocalX + orbit.basisQ.z * perifocalY;
    return target;
  }
  target[0] = vector.positionAu.x + vector.velocityAuPerDay.x * days;
  target[1] = vector.positionAu.y + vector.velocityAuPerDay.y * days;
  target[2] = vector.positionAu.z + vector.velocityAuPerDay.z * days;
  return target;
}

function positionFromWindow(
  window: EphemerisWindow,
  simulationAtMs: number,
): CartesianVector | null {
  const samples = window.samples;
  const firstAt = Date.parse(samples[0]?.observedAt ?? "");
  const lastAt = Date.parse(samples.at(-1)?.observedAt ?? "");
  if (simulationAtMs < firstAt || simulationAtMs > lastAt) return null;

  const upperIndex = samples.findIndex(
    ({ observedAt }) => Date.parse(observedAt) >= simulationAtMs,
  );
  if (upperIndex <= 0) return samples[0]?.positionAu ?? null;
  const lower = samples[upperIndex - 1];
  const upper = samples[upperIndex];
  const lowerAt = Date.parse(lower.observedAt);
  const upperAt = Date.parse(upper.observedAt);
  if (simulationAtMs === upperAt) return upper.positionAu;

  const intervalDays = (upperAt - lowerAt) / MILLISECONDS_PER_DAY;
  const t = (simulationAtMs - lowerAt) / (upperAt - lowerAt);
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const coordinate = (axis: keyof CartesianVector) =>
    h00 * lower.positionAu[axis] +
    h10 * intervalDays * lower.velocityAuPerDay[axis] +
    h01 * upper.positionAu[axis] +
    h11 * intervalDays * upper.velocityAuPerDay[axis];
  return { x: coordinate("x"), y: coordinate("y"), z: coordinate("z") };
}

export function propagatedPositionAu(
  vector: EphemerisVector,
  observedAt: string,
  simulationAtMs: number,
  allowExtendedOsculatingPreview = false,
  window?: EphemerisWindow,
): CartesianVector {
  const interpolated = window
    ? positionFromWindow(window, simulationAtMs)
    : null;
  if (interpolated) return interpolated;
  const rawDays =
    (simulationAtMs - Date.parse(observedAt)) / MILLISECONDS_PER_DAY;
  const orbit = osculatingOrbitFor(vector);
  if (allowExtendedOsculatingPreview && orbit) {
    return positionAfterDays(vector, rawDays, orbit);
  }
  const days = Math.max(
    -MAX_PROPAGATION_DAYS,
    Math.min(MAX_PROPAGATION_DAYS, rawDays),
  );
  return positionAfterDays(vector, days, orbit);
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
  allowExtendedOsculatingPreview = false,
  window?: EphemerisWindow,
): readonly [number, number, number] {
  return vectorToScenePosition(
    propagatedPositionAu(
      vector,
      observedAt,
      simulationAtMs,
      allowExtendedOsculatingPreview,
      window,
    ),
    scaleMode,
  );
}

/**
 * Compiles the invariant orbital inputs once and writes subsequent positions
 * into a caller-owned tuple. The scene uses this in its render loop to avoid
 * rebuilding orbital elements and allocating transient vectors every frame.
 */
export function createEphemerisScenePositionEvaluator(
  vector: EphemerisVector,
  observedAt: string,
  scaleMode: ScaleMode,
  allowExtendedOsculatingPreview = false,
  window?: EphemerisWindow,
): EphemerisScenePositionEvaluator {
  const observedAtMs = Date.parse(observedAt);
  const orbit = osculatingOrbitFor(vector);
  const samples = window?.samples.map((sample) => ({
    at: Date.parse(sample.observedAt),
    sample,
  }));
  const positionAu: MutableScenePosition = [0, 0, 0];
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;

  return (simulationAtMs, target) => {
    let resolvedFromWindow = false;
    if (
      samples &&
      samples.length > 0 &&
      simulationAtMs >= samples[0].at &&
      simulationAtMs <= samples[samples.length - 1].at
    ) {
      let upperIndex = 0;
      while (
        upperIndex < samples.length &&
        samples[upperIndex].at < simulationAtMs
      ) {
        upperIndex += 1;
      }

      if (upperIndex === 0) {
        const first = samples[0].sample.positionAu;
        positionAu[0] = first.x;
        positionAu[1] = first.y;
        positionAu[2] = first.z;
      } else {
        const lower = samples[upperIndex - 1];
        const upper = samples[upperIndex];
        if (simulationAtMs === upper.at) {
          positionAu[0] = upper.sample.positionAu.x;
          positionAu[1] = upper.sample.positionAu.y;
          positionAu[2] = upper.sample.positionAu.z;
        } else {
          const intervalDays = (upper.at - lower.at) / MILLISECONDS_PER_DAY;
          const t = (simulationAtMs - lower.at) / (upper.at - lower.at);
          const t2 = t * t;
          const t3 = t2 * t;
          const h00 = 2 * t3 - 3 * t2 + 1;
          const h10 = t3 - 2 * t2 + t;
          const h01 = -2 * t3 + 3 * t2;
          const h11 = t3 - t2;
          positionAu[0] =
            h00 * lower.sample.positionAu.x +
            h10 * intervalDays * lower.sample.velocityAuPerDay.x +
            h01 * upper.sample.positionAu.x +
            h11 * intervalDays * upper.sample.velocityAuPerDay.x;
          positionAu[1] =
            h00 * lower.sample.positionAu.y +
            h10 * intervalDays * lower.sample.velocityAuPerDay.y +
            h01 * upper.sample.positionAu.y +
            h11 * intervalDays * upper.sample.velocityAuPerDay.y;
          positionAu[2] =
            h00 * lower.sample.positionAu.z +
            h10 * intervalDays * lower.sample.velocityAuPerDay.z +
            h01 * upper.sample.positionAu.z +
            h11 * intervalDays * upper.sample.velocityAuPerDay.z;
        }
      }
      resolvedFromWindow = true;
    }

    if (!resolvedFromWindow) {
      const rawDays = (simulationAtMs - observedAtMs) / MILLISECONDS_PER_DAY;
      const days =
        allowExtendedOsculatingPreview && orbit
          ? rawDays
          : Math.max(
              -MAX_PROPAGATION_DAYS,
              Math.min(MAX_PROPAGATION_DAYS, rawDays),
            );
      writePositionAfterDays(positionAu, vector, days, orbit);
    }

    const distanceAu = Math.hypot(positionAu[0], positionAu[1], positionAu[2]);
    if (distanceAu === 0) {
      target[0] = 0;
      target[1] = 0;
      target[2] = 0;
      return target;
    }
    const factor = strategy.distanceFromAu(distanceAu) / distanceAu;
    target[0] = positionAu[0] * factor;
    target[1] = positionAu[2] * factor;
    target[2] = -positionAu[1] * factor;
    return target;
  };
}

export function ephemerisOrbitScenePoints(
  vector: EphemerisVector,
  scaleMode: ScaleMode,
  segments: number,
): ReadonlyArray<readonly [number, number, number]> {
  const orbit = osculatingOrbitFor(vector);
  if (!orbit) return [vectorToScenePosition(vector.positionAu, scaleMode)];

  const safeSegments = Math.max(24, Math.floor(segments));
  const denseSegments = Math.min(8_192, Math.max(2_048, safeSegments * 16));
  const points = Array.from({ length: denseSegments }, (_, index) =>
    vectorToScenePosition(
      positionOnOrbitAtEccentricAnomaly(
        orbit,
        (index / denseSegments) * Math.PI * 2,
      ),
      scaleMode,
    ),
  );
  const first =
    points[0] ?? vectorToScenePosition(vector.positionAu, scaleMode);
  return resampleClosedOrbitByArcLength(
    [...points, [first[0], first[1], first[2]] as const],
    safeSegments,
  );
}
