import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import type { DwarfSatellite } from "./dwarf-satellite-catalogue";
import { dwarfSatelliteOrbitDistance } from "./dwarf-satellite-scene-metrics";
import { solveEllipticKepler } from "./elliptic-orbit-evaluator";

const DAY_MS = 86_400_000;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const TWO_PI = Math.PI * 2;

export function dwarfSatelliteOrbitNormal(
  moon: DwarfSatellite,
): readonly [number, number, number] {
  if (moon.inclinationDeg === null) return [0, 1, 0];
  const inclination = (moon.inclinationDeg * Math.PI) / 180;
  return [0, Math.cos(inclination), Math.sin(inclination)];
}

export function dwarfSatellitePositionAtEccentricAnomaly(
  moon: DwarfSatellite,
  eccentricAnomaly: number,
  semiMajorAxisScene: number,
): readonly [number, number, number] {
  const eccentricity = moon.eccentricity ?? 0;
  const barycentricFactor = moon.id === "dwarf-satellite-charon" ? 0.892 : 1;
  const inclination = ((moon.inclinationDeg ?? 0) * Math.PI) / 180;
  const planeX =
    semiMajorAxisScene * (Math.cos(eccentricAnomaly) - eccentricity);
  const planeZ =
    semiMajorAxisScene *
    Math.sqrt(1 - eccentricity * eccentricity) *
    Math.sin(eccentricAnomaly);
  return [
    planeX * barycentricFactor,
    -planeZ * Math.sin(inclination) * barycentricFactor,
    planeZ * Math.cos(inclination) * barycentricFactor,
  ];
}

export function dwarfSatellitePositionAt(
  moon: DwarfSatellite,
  timestampMs: number,
  parentMeanRadiusKm: number,
  parentRadius: number,
  scaleMode: ScaleMode,
): readonly [number, number, number] {
  const elapsedDays = (timestampMs - J2000_MS) / DAY_MS;
  const meanAnomaly =
    (moon.phaseAtEpochDeg * Math.PI) / 180 +
    (elapsedDays / moon.orbitalPeriodDays) * TWO_PI;
  const eccentricity = moon.eccentricity ?? 0;
  const eccentricAnomaly = solveEllipticKepler(
    meanAnomaly,
    eccentricity,
  ).eccentricAnomalyRadians;
  return dwarfSatellitePositionAtEccentricAnomaly(
    moon,
    eccentricAnomaly,
    dwarfSatelliteOrbitDistance(
      moon,
      parentMeanRadiusKm,
      parentRadius,
      scaleMode,
    ),
  );
}

export function dwarfSatelliteOrbitPoints(
  moon: DwarfSatellite,
  semiMajorAxisScene: number,
  segments: number,
): readonly (readonly [number, number, number])[] {
  const safeSegments = Math.max(24, Math.round(segments));
  const points = Array.from({ length: safeSegments }, (_, index) =>
    dwarfSatellitePositionAtEccentricAnomaly(
      moon,
      (index / safeSegments) * TWO_PI,
      semiMajorAxisScene,
    ),
  );
  const first = points[0] ?? [0, 0, 0];
  return [...points, [first[0], first[1], first[2]] as const];
}
