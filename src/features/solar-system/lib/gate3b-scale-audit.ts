import { planets } from "@/content/planets";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";

import {
  visualProfileFor,
  visualRegistryIds,
  type VisualBodyId,
} from "./celestial-visual-registry";
import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";
import { dwarfSatelliteSceneMetrics } from "./dwarf-satellite-scene-metrics";
import { extendedBodySceneMetrics } from "./extended-body-scene-metrics";
import { EXTENDED_BODIES } from "./extended-system";
import { FEATURED_MOONS } from "./moon-catalogue";
import { moonSceneMetrics } from "./moon-scene-metrics";
import { createScenePlanets, sceneScaleFor } from "./scene-planets";

const AU_KM = 149_597_870.7;

export type Gate3BScaleAuditStatus = "pass" | "review" | "fail";

export interface Gate3BScalePair {
  readonly exploration: number;
  readonly scientific: number;
}

export interface Gate3BScaleAuditRow {
  readonly bodyId: VisualBodyId;
  readonly parentId: string;
  readonly category: string;
  readonly physicalRadiusKm: number;
  readonly renderedRadiusExplore: number;
  readonly renderedRadiusScientific: number;
  readonly visualAmplification: Gate3BScalePair;
  readonly parentDistance: Gate3BScalePair & { readonly physicalKm: number };
  readonly orbitExtent: Gate3BScalePair;
  readonly focusRadius: Gate3BScalePair;
  readonly geometryBounds: Gate3BScalePair;
  readonly systemExtent: Gate3BScalePair;
  readonly representationStatus: Gate3BScaleAuditStatus;
  readonly flags: readonly string[];
}

export interface Gate3BScaleAuditArtifact {
  readonly schemaVersion: 1;
  readonly generatedFrom: string;
  readonly bodies: readonly Gate3BScaleAuditRow[];
  readonly summary: {
    readonly total: number;
    readonly pass: number;
    readonly review: number;
    readonly fail: number;
  };
}

const scenePlanets = createScenePlanets(planets);
const scenePlanetById = new Map(
  scenePlanets.map((planet) => [planet.id, planet]),
);

function geometryMultiplier(bodyId: VisualBodyId): number {
  const visual = visualProfileFor(bodyId);
  return Math.max(...visual.geometry.scale, visual.ring?.outerRadius ?? 1);
}

function statusFor(flags: readonly string[]): Gate3BScaleAuditStatus {
  if (flags.some((flag) => flag.startsWith("fail:"))) return "fail";
  if (flags.length > 0) return "review";
  return "pass";
}

function validateCommon(input: {
  explorationRadius: number;
  scientificRadius: number;
  explorationDistance: number;
  scientificDistance: number;
  explorationBounds: number;
  scientificBounds: number;
  explorationFocus: number;
  scientificFocus: number;
  procedural: boolean;
}): string[] {
  const flags: string[] = [];
  for (const [label, value] of Object.entries(input)) {
    if (typeof value === "number" && (!Number.isFinite(value) || value <= 0)) {
      flags.push(`fail:${label}-not-positive-finite`);
    }
  }
  if (input.explorationFocus < input.explorationBounds) {
    flags.push("fail:exploration-focus-inside-geometry");
  }
  if (input.scientificFocus < input.scientificBounds) {
    flags.push("fail:scientific-focus-inside-geometry");
  }
  if (input.explorationBounds >= input.explorationDistance) {
    flags.push("fail:exploration-body-overlaps-parent-origin");
  }
  if (input.scientificBounds >= input.scientificDistance) {
    flags.push("fail:scientific-body-overlaps-parent-origin");
  }
  if (input.explorationFocus / input.explorationBounds > 12) {
    flags.push("review:exploration-focus-excessively-larger-than-geometry");
  }
  if (input.scientificFocus / input.scientificBounds > 12) {
    flags.push("review:scientific-focus-excessively-larger-than-geometry");
  }
  if (input.procedural)
    flags.push("review:procedural-surface-gpu-review-required");
  return flags;
}

function featuredMoonRows(): Gate3BScaleAuditRow[] {
  return FEATURED_MOONS.map((moon) => {
    const parent = scenePlanetById.get(moon.parentPlanetId);
    if (!parent) throw new Error(`Missing scene parent for ${moon.id}`);
    const explore = moonSceneMetrics(
      moon,
      sceneScaleFor(parent, "exploration").radius,
      parent.meanRadiusKm,
      "exploration",
    );
    const scientific = moonSceneMetrics(
      moon,
      sceneScaleFor(parent, "scientific").radius,
      parent.meanRadiusKm,
      "scientific",
    );
    const flags = validateCommon({
      explorationRadius: explore.renderedRadius,
      scientificRadius: scientific.renderedRadius,
      explorationDistance: explore.semiMajorAxis,
      scientificDistance: scientific.semiMajorAxis,
      explorationBounds: explore.geometryBounds,
      scientificBounds: scientific.geometryBounds,
      explorationFocus: explore.focusRadius,
      scientificFocus: scientific.focusRadius,
      procedural:
        visualProfileFor(moon.id).surface.representation ===
        "procedural-reconstruction",
    });
    if (explore.renderedRadius / explore.physicalRadius > 50) {
      flags.push("review:high-exploration-visual-amplification");
    }
    return Object.freeze({
      bodyId: moon.id,
      parentId: moon.parentPlanetId,
      category: "featured-moon",
      physicalRadiusKm: moon.meanRadiusKm,
      renderedRadiusExplore: explore.renderedRadius,
      renderedRadiusScientific: scientific.renderedRadius,
      visualAmplification: Object.freeze({
        exploration: explore.renderedRadius / explore.physicalRadius,
        scientific: scientific.renderedRadius / scientific.physicalRadius,
      }),
      parentDistance: Object.freeze({
        exploration: explore.semiMajorAxis,
        scientific: scientific.semiMajorAxis,
        physicalKm: moon.semiMajorAxisKm,
      }),
      orbitExtent: Object.freeze({
        exploration: explore.orbitExtent,
        scientific: scientific.orbitExtent,
      }),
      focusRadius: Object.freeze({
        exploration: explore.focusRadius,
        scientific: scientific.focusRadius,
      }),
      geometryBounds: Object.freeze({
        exploration: explore.geometryBounds,
        scientific: scientific.geometryBounds,
      }),
      systemExtent: Object.freeze({
        exploration: explore.orbitExtent + explore.geometryBounds,
        scientific: scientific.orbitExtent + scientific.geometryBounds,
      }),
      representationStatus: statusFor(flags),
      flags: Object.freeze(flags),
    });
  });
}

function dwarfSatelliteRows(): Gate3BScaleAuditRow[] {
  return DWARF_SATELLITES.map((moon) => {
    const parent = EXTENDED_BODIES.find((body) => body.id === moon.parentId);
    if (!parent) throw new Error(`Missing dwarf-system parent for ${moon.id}`);
    const parentExplore = Math.max(
      parent.kind === "comet" ? 0.1 : 0.17,
      explorationScale.radiusFromKm(parent.meanRadiusKm),
    );
    const parentScientific = scientificScale.radiusFromKm(parent.meanRadiusKm);
    const explore = dwarfSatelliteSceneMetrics(
      moon,
      parent.meanRadiusKm,
      parentExplore,
      "exploration",
    );
    const scientific = dwarfSatelliteSceneMetrics(
      moon,
      parent.meanRadiusKm,
      parentScientific,
      "scientific",
    );
    const boundsMultiplier = geometryMultiplier(moon.id);
    const boundsExplore = explore.renderedRadius * boundsMultiplier;
    const boundsScientific = scientific.renderedRadius * boundsMultiplier;
    const flags = validateCommon({
      explorationRadius: explore.renderedRadius,
      scientificRadius: scientific.renderedRadius,
      explorationDistance: explore.semiMajorAxis,
      scientificDistance: scientific.semiMajorAxis,
      explorationBounds: boundsExplore,
      scientificBounds: boundsScientific,
      explorationFocus: explore.focusRadius,
      scientificFocus: scientific.focusRadius,
      procedural:
        visualProfileFor(moon.id).surface.representation ===
        "procedural-reconstruction",
    });
    if (
      moon.orbitPlaneStatus === "representative-parent-equatorial-unresolved"
    ) {
      flags.push("review:orbit-plane-unresolved");
    }
    return Object.freeze({
      bodyId: moon.id,
      parentId: moon.parentId,
      category: "dwarf-system-satellite",
      physicalRadiusKm: moon.meanRadiusKm,
      renderedRadiusExplore: explore.renderedRadius,
      renderedRadiusScientific: scientific.renderedRadius,
      visualAmplification: Object.freeze({
        exploration: explore.renderedRadius / explore.physicalRadius,
        scientific: scientific.renderedRadius / scientific.physicalRadius,
      }),
      parentDistance: Object.freeze({
        exploration: explore.semiMajorAxis,
        scientific: scientific.semiMajorAxis,
        physicalKm: moon.semiMajorAxisKm,
      }),
      orbitExtent: Object.freeze({
        exploration: explore.orbitExtent,
        scientific: scientific.orbitExtent,
      }),
      focusRadius: Object.freeze({
        exploration: explore.focusRadius,
        scientific: scientific.focusRadius,
      }),
      geometryBounds: Object.freeze({
        exploration: boundsExplore,
        scientific: boundsScientific,
      }),
      systemExtent: Object.freeze({
        exploration: explore.orbitExtent + boundsExplore,
        scientific: scientific.orbitExtent + boundsScientific,
      }),
      representationStatus: statusFor(flags),
      flags: Object.freeze(flags),
    });
  });
}

function extendedBodyRows(): Gate3BScaleAuditRow[] {
  return EXTENDED_BODIES.map((body) => {
    const profile = visualProfileFor(body.id);
    const physicalExplore = explorationScale.radiusFromKm(body.meanRadiusKm);
    const exploreMetrics = extendedBodySceneMetrics(body, "exploration");
    const scientificMetrics = extendedBodySceneMetrics(body, "scientific");
    const renderedExplore = exploreMetrics.renderedRadius;
    const renderedScientific = scientificMetrics.renderedRadius;
    const distanceExplore = explorationScale.distanceFromAu(
      body.semiMajorAxisAu,
    );
    const distanceScientific = scientificScale.distanceFromAu(
      body.semiMajorAxisAu,
    );
    const orbitExplore = explorationScale.distanceFromAu(
      body.semiMajorAxisAu * (1 + body.eccentricity),
    );
    const orbitScientific = scientificScale.distanceFromAu(
      body.semiMajorAxisAu * (1 + body.eccentricity),
    );
    const boundsExplore = exploreMetrics.geometryBounds;
    const boundsScientific = scientificMetrics.geometryBounds;
    const focusExplore = exploreMetrics.focusRadius;
    const focusScientific = scientificMetrics.focusRadius;
    const flags = validateCommon({
      explorationRadius: renderedExplore,
      scientificRadius: renderedScientific,
      explorationDistance: distanceExplore,
      scientificDistance: distanceScientific,
      explorationBounds: boundsExplore,
      scientificBounds: boundsScientific,
      explorationFocus: focusExplore,
      scientificFocus: focusScientific,
      procedural:
        profile.surface.representation === "procedural-reconstruction",
    });
    if (renderedExplore / physicalExplore > 1_000) {
      flags.push("review:extreme-exploration-visual-amplification");
    }
    return Object.freeze({
      bodyId: body.id,
      parentId: "sun",
      category: profile.category,
      physicalRadiusKm: body.meanRadiusKm,
      renderedRadiusExplore: renderedExplore,
      renderedRadiusScientific: renderedScientific,
      visualAmplification: Object.freeze({
        exploration: renderedExplore / physicalExplore,
        scientific: 1,
      }),
      parentDistance: Object.freeze({
        exploration: distanceExplore,
        scientific: distanceScientific,
        physicalKm: body.semiMajorAxisAu * AU_KM,
      }),
      orbitExtent: Object.freeze({
        exploration: orbitExplore,
        scientific: orbitScientific,
      }),
      focusRadius: Object.freeze({
        exploration: focusExplore,
        scientific: focusScientific,
      }),
      geometryBounds: Object.freeze({
        exploration: boundsExplore,
        scientific: boundsScientific,
      }),
      systemExtent: Object.freeze({
        exploration: exploreMetrics.systemExtent,
        scientific: scientificMetrics.systemExtent,
      }),
      representationStatus: statusFor(flags),
      flags: Object.freeze(flags),
    });
  });
}

export function createGate3BScaleAudit(): Gate3BScaleAuditArtifact {
  const bodies = Object.freeze([
    ...featuredMoonRows(),
    ...dwarfSatelliteRows(),
    ...extendedBodyRows(),
  ]);
  if (bodies.length !== visualRegistryIds.length) {
    throw new Error(
      `Gate 3B scale audit expected ${visualRegistryIds.length} bodies, received ${bodies.length}.`,
    );
  }
  const summary = Object.freeze({
    total: bodies.length,
    pass: bodies.filter((body) => body.representationStatus === "pass").length,
    review: bodies.filter((body) => body.representationStatus === "review")
      .length,
    fail: bodies.filter((body) => body.representationStatus === "fail").length,
  });
  return Object.freeze({
    schemaVersion: 1,
    generatedFrom: "gate3b-scale-audit.ts",
    bodies,
    summary,
  });
}

export const GATE3B_SCALE_AUDIT = createGate3BScaleAudit();
