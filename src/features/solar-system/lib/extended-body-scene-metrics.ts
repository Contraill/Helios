import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import {
  visualProfileFor,
  type VisualBodyId,
} from "./celestial-visual-registry";
import {
  dwarfSatellitesFor,
  type DwarfSystemParentId,
} from "./dwarf-satellite-catalogue";
import {
  dwarfParentVisualOffset,
  dwarfSatelliteSceneMetrics,
} from "./dwarf-satellite-scene-metrics";
import { extendedBodyRadius, type ExtendedBody } from "./extended-system";
import { sceneProfileFor } from "./scene-profiles";
import { isDwarfSystemParentId } from "../types/celestial-body";

export interface ExtendedBodySceneMetrics {
  readonly renderedRadius: number;
  readonly interactionRadius: number;
  readonly geometryBounds: number;
  readonly comaExtent: number;
  readonly focusRadius: number;
  readonly systemExtent: number;
  readonly parentVisualOffset: readonly [number, number, number];
}

function geometryMultiplier(bodyId: VisualBodyId): number {
  const visual = visualProfileFor(bodyId);
  return Math.max(...visual.geometry.scale, visual.ring?.outerRadius ?? 1);
}

function dwarfSystemExtent(
  parentId: DwarfSystemParentId,
  parentMeanRadiusKm: number,
  parentRadius: number,
  parentGeometryBounds: number,
  scaleMode: ScaleMode,
): number {
  const parentOffset = dwarfParentVisualOffset(
    parentId,
    parentRadius,
    scaleMode,
  );
  let extent = Math.abs(parentOffset[0]) + parentGeometryBounds;
  for (const satellite of dwarfSatellitesFor(parentId)) {
    const metrics = dwarfSatelliteSceneMetrics(
      satellite,
      parentMeanRadiusKm,
      parentRadius,
      scaleMode,
    );
    const satelliteBounds =
      metrics.renderedRadius * geometryMultiplier(satellite.id);
    extent = Math.max(extent, metrics.orbitExtent + satelliteBounds);
  }
  return extent;
}

export function extendedBodySceneMetrics(
  body: ExtendedBody,
  scaleMode: ScaleMode,
): ExtendedBodySceneMetrics {
  const profile = sceneProfileFor(scaleMode);
  const renderedRadius = extendedBodyRadius(body, scaleMode);
  const interactionRadius = Math.max(
    renderedRadius * 2,
    profile.extended.minimumInteractionRadius,
  );
  const geometryBounds = renderedRadius * geometryMultiplier(body.id);
  const comaExtent =
    body.kind === "comet"
      ? scaleMode === "scientific"
        ? renderedRadius * 3.8
        : Math.max(renderedRadius * 3.8, 0.16)
      : 0;
  const focusRadius = Math.max(geometryBounds, comaExtent);
  const parentVisualOffset = isDwarfSystemParentId(body.id)
    ? dwarfParentVisualOffset(body.id, renderedRadius, scaleMode)
    : ([0, 0, 0] as const);
  const systemExtent = isDwarfSystemParentId(body.id)
    ? dwarfSystemExtent(
        body.id,
        body.meanRadiusKm,
        renderedRadius,
        geometryBounds,
        scaleMode,
      )
    : focusRadius;

  return Object.freeze({
    renderedRadius,
    interactionRadius,
    geometryBounds,
    comaExtent,
    focusRadius,
    systemExtent,
    parentVisualOffset,
  });
}
