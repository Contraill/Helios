import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";

import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";
import { EXTENDED_BODIES } from "./extended-system";
import { FEATURED_MOONS } from "./moon-catalogue";

export type OrbitAccuracyCategory =
  "planet" | "featured-moon" | "extended-body" | "dwarf-satellite";

export type OrbitTimingStatus =
  | "horizons-source-state"
  | "horizons-window"
  | "bounded-osculating-preview"
  | "representative-mean-elements"
  | "verified-fallback-elements"
  | "representative-unresolved-plane";

export interface OrbitAccuracyRecord {
  readonly bodyId: string;
  readonly category: OrbitAccuracyCategory;
  readonly provider: string;
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly targetCode: string | null;
  readonly referenceFrame: string;
  readonly referencePlane: string;
  readonly epochLabel: string;
  readonly timingStatus: OrbitTimingStatus;
  readonly highFidelityPositionClaimAllowed: boolean;
  readonly renderedPathMatchesTimingModel: true;
  readonly limitation: string;
}

export interface OrbitAccuracyAudit {
  readonly schemaVersion: 1;
  readonly auditedAt: string;
  readonly records: readonly OrbitAccuracyRecord[];
  readonly summary: {
    readonly total: number;
    readonly highFidelityAtAuditedTime: number;
    readonly representative: number;
    readonly unresolvedPlane: number;
  };
}

function planetRecords(timestampMs: number): readonly OrbitAccuracyRecord[] {
  const exactSourceTimestamp = Date.parse(HORIZONS_SNAPSHOT.observedAt);
  return HORIZONS_SNAPSHOT.vectors.map((vector) => {
    const window = HORIZONS_SNAPSHOT.windows?.find(
      (candidate) => candidate.planetId === vector.planetId,
    );
    const insideWindow = window
      ? timestampMs >= Date.parse(window.startAt) &&
        timestampMs <= Date.parse(window.endAt)
      : false;
    const exactSourceState = Math.abs(timestampMs - exactSourceTimestamp) < 1;
    const timingStatus: OrbitTimingStatus = insideWindow
      ? "horizons-window"
      : exactSourceState
        ? "horizons-source-state"
        : "bounded-osculating-preview";
    const highFidelity = insideWindow || exactSourceState;
    return {
      bodyId: vector.planetId,
      category: "planet",
      provider: HORIZONS_SNAPSHOT.metadata.provider,
      sourceId: "jpl-horizons-vectors",
      sourceUrl: HORIZONS_SNAPSHOT.metadata.sourceUrl,
      targetCode: vector.targetId,
      referenceFrame: HORIZONS_SNAPSHOT.metadata.referenceSystem,
      referencePlane: HORIZONS_SNAPSHOT.metadata.referencePlane,
      epochLabel: HORIZONS_SNAPSHOT.observedAt,
      timingStatus,
      highFidelityPositionClaimAllowed: highFidelity,
      renderedPathMatchesTimingModel: true,
      limitation: highFidelity
        ? "The rendered state is sourced from, or interpolated inside, a Horizons vector window."
        : "The current fallback bundle has no Horizons window at this timestamp; Helios propagates a bounded two-body osculating preview from the source vector.",
    } satisfies OrbitAccuracyRecord;
  });
}

function moonRecords(): readonly OrbitAccuracyRecord[] {
  return FEATURED_MOONS.map((moon) => ({
    bodyId: moon.id,
    category: "featured-moon",
    provider: moon.representation.provider,
    sourceId: moon.representation.sourceId,
    sourceUrl: moon.representation.sourceUrl,
    targetCode: moon.targetCode,
    referenceFrame: moon.referenceFrame,
    referencePlane: moon.representation.referencePlane,
    epochLabel: moon.representation.epoch.calendarLabel,
    timingStatus: "representative-mean-elements",
    highFidelityPositionClaimAllowed: false,
    renderedPathMatchesTimingModel: true,
    limitation:
      "JPL fitted mean elements describe general orbit shape and orientation. Precession metadata is not propagated, so the rendered date position is representative rather than an ephemeris.",
  }));
}

function extendedRecords(): readonly OrbitAccuracyRecord[] {
  return EXTENDED_BODIES.map((body) => ({
    bodyId: body.id,
    category: "extended-body",
    provider: body.representation.provider,
    sourceId: body.representation.sourceId,
    sourceUrl: body.representation.sourceUrl,
    targetCode: body.representation.targetCode ?? null,
    referenceFrame: body.representation.referenceFrame,
    referencePlane: body.representation.referencePlane,
    epochLabel: body.representation.epoch.calendarLabel,
    timingStatus:
      body.representation.representationType === "verified-fallback"
        ? "verified-fallback-elements"
        : "representative-mean-elements",
    highFidelityPositionClaimAllowed: false,
    renderedPathMatchesTimingModel: true,
    limitation:
      body.kind === "comet"
        ? "A frozen two-body element set is propagated for visual preview. Planetary perturbations and comet non-gravitational acceleration are not integrated; Horizons is required for date-accurate positions."
        : body.representation.precisionNote,
  }));
}

function dwarfSatelliteRecords(): readonly OrbitAccuracyRecord[] {
  return DWARF_SATELLITES.map((moon) => ({
    bodyId: moon.id,
    category: "dwarf-satellite",
    provider: moon.representation.provider,
    sourceId: moon.representation.sourceId,
    sourceUrl: moon.representation.sourceUrl,
    targetCode: moon.representation.targetCode ?? null,
    referenceFrame: moon.representation.referenceFrame,
    referencePlane: moon.representation.referencePlane,
    epochLabel: moon.representation.epoch.calendarLabel,
    timingStatus:
      moon.orbitPlaneStatus === "source-backed-parent-equatorial"
        ? "representative-mean-elements"
        : "representative-unresolved-plane",
    highFidelityPositionClaimAllowed: false,
    renderedPathMatchesTimingModel: true,
    limitation: moon.representation.precisionNote,
  }));
}

export function orbitAccuracyAudit(timestampMs: number): OrbitAccuracyAudit {
  const records = [
    ...planetRecords(timestampMs),
    ...moonRecords(),
    ...extendedRecords(),
    ...dwarfSatelliteRecords(),
  ];
  return {
    schemaVersion: 1,
    auditedAt: new Date(timestampMs).toISOString(),
    records,
    summary: {
      total: records.length,
      highFidelityAtAuditedTime: records.filter(
        (record) => record.highFidelityPositionClaimAllowed,
      ).length,
      representative: records.filter(
        (record) =>
          record.timingStatus !== "horizons-window" &&
          record.timingStatus !== "horizons-source-state" &&
          record.timingStatus !== "representative-unresolved-plane",
      ).length,
      unresolvedPlane: records.filter(
        (record) => record.timingStatus === "representative-unresolved-plane",
      ).length,
    },
  };
}
