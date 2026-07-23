import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import { visualProfileFor } from "./celestial-visual-registry";
import type { Moon } from "./moon-catalogue";
import {
  moonOrbitDistanceScene,
  moonPhysicalRadiusScene,
} from "./moon-position";
import { sceneProfileFor } from "./scene-profiles";

export interface MoonSceneMetrics {
  readonly physicalRadius: number;
  readonly renderedRadius: number;
  readonly interactionRadius: number;
  readonly geometryBounds: number;
  readonly focusRadius: number;
  readonly semiMajorAxis: number;
  readonly orbitExtent: number;
}

export function moonSceneMetrics(
  moon: Moon,
  parentRadiusScene: number,
  parentMeanRadiusKm: number,
  scaleMode: ScaleMode,
): MoonSceneMetrics {
  const profile = sceneProfileFor(scaleMode);
  const physicalRadius = moonPhysicalRadiusScene(
    moon,
    parentRadiusScene,
    parentMeanRadiusKm,
  );
  const explorationRadius = Math.max(
    physicalRadius,
    Math.min(parentRadiusScene * 0.22, 0.16),
  );
  const renderedRadius =
    profile.scale.bodyProfile === "physical-ratio"
      ? physicalRadius
      : explorationRadius;
  const interactionRadius = Math.max(
    renderedRadius * 2.6,
    profile.body.moonMinimumInteractionRadius,
  );
  const visual = visualProfileFor(moon.id);
  const geometryBounds =
    renderedRadius *
    Math.max(...visual.geometry.scale, visual.ring?.outerRadius ?? 1);
  const focusRadius =
    scaleMode === "scientific"
      ? geometryBounds
      : Math.max(geometryBounds, profile.body.moonMinimumVisualRadius);
  const semiMajorAxis = moonOrbitDistanceScene(
    moon,
    parentRadiusScene,
    parentMeanRadiusKm,
    scaleMode,
  );
  return Object.freeze({
    physicalRadius,
    renderedRadius,
    interactionRadius,
    geometryBounds,
    focusRadius,
    semiMajorAxis,
    orbitExtent: semiMajorAxis * (1 + moon.eccentricity),
  });
}
