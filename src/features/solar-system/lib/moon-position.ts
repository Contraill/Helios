import { EllipticOrbitEvaluator } from "./elliptic-orbit-evaluator";
import { referenceBasis } from "./reference-frame-math";
import { sceneProfileFor } from "./scene-profiles";

import type { Moon } from "./moon-catalogue";

export type MoonScenePosition = readonly [number, number, number];

const evaluatorCache = new WeakMap<Moon, EllipticOrbitEvaluator>();

export function moonOrbitEvaluator(moon: Moon): EllipticOrbitEvaluator {
  const cached = evaluatorCache.get(moon);
  if (cached) return cached;
  const evaluator = new EllipticOrbitEvaluator(
    {
      semiMajorAxis: moon.semiMajorAxisKm,
      eccentricity: moon.eccentricity,
      inclinationDeg: moon.inclinationDeg,
      longitudeAscendingNodeDeg: moon.longitudeAscendingNodeDeg,
      argumentOfPeriapsisDeg: moon.argumentOfPeriapsisDeg,
      meanAnomalyAtEpochDeg: moon.meanAnomalyAtEpochDeg,
      epochJulianDateTdb: moon.representation.epoch.julianDate,
      orbitalPeriodDays: moon.orbitalPeriodDays,
    },
    referenceBasis(moon.referenceFrame, {
      parentPlanetId: moon.parentPlanetId,
      laplacePole: moon.laplacePole,
    }),
  );
  evaluatorCache.set(moon, evaluator);
  return evaluator;
}

export function moonLocalPositionAt(
  moon: Moon,
  simulationTimeMs: number,
  semiMajorAxisScene: number,
  target: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  moonOrbitEvaluator(moon).positionAtUtcMs(simulationTimeMs, target);
  const scale = semiMajorAxisScene / moon.semiMajorAxisKm;
  target[0] *= scale;
  target[1] *= scale;
  target[2] *= scale;
  return target;
}

export function moonOrbitPoints(
  moon: Moon,
  semiMajorAxisScene: number,
  segments: number,
): readonly MoonScenePosition[] {
  const scale = semiMajorAxisScene / moon.semiMajorAxisKm;
  return moonOrbitEvaluator(moon).samplePath(segments, (source, target) => {
    target[0] = source[0] * scale;
    target[1] = source[1] * scale;
    target[2] = source[2] * scale;
    return target;
  });
}

export function moonOrbitNormalScene(
  moon: Moon,
  target: [number, number, number] = [0, 1, 0],
): [number, number, number] {
  const evaluator = moonOrbitEvaluator(moon);
  const points = evaluator.samplePath(4);
  const first = points[0] ?? [1, 0, 0];
  const second = points[1] ?? [0, 0, 1];
  const ax = first[0];
  const ay = first[1];
  const az = first[2];
  const bx = second[0];
  const by = second[1];
  const bz = second[2];
  target[0] = ay * bz - az * by;
  target[1] = az * bx - ax * bz;
  target[2] = ax * by - ay * bx;
  const length = Math.hypot(target[0], target[1], target[2]);
  if (length < 1e-12) {
    target[0] = 0;
    target[1] = 1;
    target[2] = 0;
  } else {
    target[0] /= length;
    target[1] /= length;
    target[2] /= length;
  }
  return target;
}

export function moonOrbitDistanceScene(
  moon: Moon,
  parentRadiusScene: number,
  parentMeanRadiusKm: number,
  scaleMode: "exploration" | "scientific",
): number {
  const physicalRatio = moon.semiMajorAxisKm / parentMeanRadiusKm;
  if (sceneProfileFor(scaleMode).scale.bodyProfile === "physical-ratio") {
    return parentRadiusScene * physicalRatio;
  }
  return (
    parentRadiusScene * 1.22 +
    Math.log10(Math.max(1, physicalRatio)) *
      Math.max(0.74, parentRadiusScene * 0.42)
  );
}

export function moonPhysicalRadiusScene(
  moon: Moon,
  parentRadiusScene: number,
  parentMeanRadiusKm: number,
): number {
  return parentRadiusScene * (moon.meanRadiusKm / parentMeanRadiusKm);
}
