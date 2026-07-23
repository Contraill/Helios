import type {
  DwarfSatellite,
  DwarfSystemParentId,
} from "./dwarf-satellite-catalogue";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

export interface DwarfSatelliteSceneMetrics {
  readonly physicalRadius: number;
  readonly renderedRadius: number;
  readonly interactionRadius: number;
  readonly focusRadius: number;
  readonly semiMajorAxis: number;
  readonly orbitExtent: number;
}

function physicalOrbitDistance(
  moon: DwarfSatellite,
  parentMeanRadiusKm: number,
  parentRadius: number,
): number {
  return parentRadius * (moon.semiMajorAxisKm / parentMeanRadiusKm);
}

export function dwarfSatelliteOrbitDistance(
  moon: DwarfSatellite,
  parentMeanRadiusKm: number,
  parentRadius: number,
  scaleMode: ScaleMode,
): number {
  if (scaleMode === "scientific") {
    return physicalOrbitDistance(moon, parentMeanRadiusKm, parentRadius);
  }
  const physicalRatio = moon.semiMajorAxisKm / parentMeanRadiusKm;
  return (
    parentRadius *
    Math.min(9.5, Math.max(3, 1.9 + Math.log10(physicalRatio) * 1.72))
  );
}

export function dwarfSatelliteSceneMetrics(
  moon: DwarfSatellite,
  parentMeanRadiusKm: number,
  parentRadius: number,
  scaleMode: ScaleMode,
): DwarfSatelliteSceneMetrics {
  const physicalRadius =
    parentRadius * (moon.meanRadiusKm / parentMeanRadiusKm);
  const renderedRadius =
    scaleMode === "scientific"
      ? physicalRadius
      : Math.max(physicalRadius, parentRadius * 0.075);
  const interactionRadius = Math.max(
    renderedRadius * 2.3,
    scaleMode === "scientific" ? renderedRadius * 1.35 : parentRadius * 0.2,
  );
  const focusRadius = Math.max(renderedRadius, interactionRadius * 0.65);
  const semiMajorAxis = dwarfSatelliteOrbitDistance(
    moon,
    parentMeanRadiusKm,
    parentRadius,
    scaleMode,
  );
  const orbitExtent = semiMajorAxis * (1 + (moon.eccentricity ?? 0));
  return Object.freeze({
    physicalRadius,
    renderedRadius,
    interactionRadius,
    focusRadius,
    semiMajorAxis,
    orbitExtent,
  });
}

export function dwarfParentVisualOffset(
  parentId: DwarfSystemParentId,
  parentRadius: number,
  scaleMode: ScaleMode,
): readonly [number, number, number] {
  if (parentId !== "pluto") return [0, 0, 0];
  const charonPhysicalRatio = 19_596 / 1_188.3;
  const distance =
    scaleMode === "scientific"
      ? parentRadius * charonPhysicalRatio
      : parentRadius *
        Math.min(
          9.5,
          Math.max(3, 1.9 + Math.log10(charonPhysicalRatio) * 1.72),
        );
  return [-distance * 0.108, 0, 0];
}
