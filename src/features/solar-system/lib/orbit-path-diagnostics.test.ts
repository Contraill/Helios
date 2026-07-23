import { describe, expect, it } from "vitest";

import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";
import {
  ephemerisOrbitScenePoints,
  ephemerisScenePosition,
} from "@/lib/data/ephemeris/positions";

import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";
import { dwarfSatelliteOrbitDistance } from "./dwarf-satellite-scene-metrics";
import {
  dwarfSatelliteOrbitPoints,
  dwarfSatellitePositionAt,
} from "./dwarf-satellite-position";
import {
  EXTENDED_BODIES,
  extendedBodyPosition,
  extendedOrbitPoints,
} from "./extended-system";
import { FEATURED_MOONS } from "./moon-catalogue";
import {
  moonLocalPositionAt,
  moonOrbitDistanceScene,
  moonOrbitPoints,
} from "./moon-position";
import {
  distanceToOrbitPath,
  orbitPathDiagnostics,
  type OrbitPoint,
} from "./orbit-path-diagnostics";

const AUDIT_TIMESTAMP_MS = Date.parse("2026-07-23T00:00:00.000Z");
const REPRESENTATIVE_TIMESTAMPS_MS = [
  Date.parse("2000-01-01T12:00:00.000Z"),
  AUDIT_TIMESTAMP_MS,
  Date.parse("2035-01-01T00:00:00.000Z"),
] as const;

function expectWellFormedOrbit(points: readonly OrbitPoint[]) {
  const diagnostics = orbitPathDiagnostics(points);
  expect(diagnostics.finite).toBe(true);
  expect(diagnostics.closed).toBe(true);
  expect(diagnostics.pointCount).toBeGreaterThanOrEqual(25);
  expect(diagnostics.maxChordToBoundsRatio).toBeLessThan(0.12);
  expect(diagnostics.maxToMedianSegmentRatio).toBeLessThan(2.6);
  return diagnostics;
}

describe("orbit path geometry audit", () => {
  it("keeps all eight planet paths finite, closed and free of long closure chords", () => {
    for (const vector of HORIZONS_SNAPSHOT.vectors) {
      for (const mode of ["exploration", "scientific"] as const) {
        const points = ephemerisOrbitScenePoints(vector, mode, 192);
        const diagnostics = expectWellFormedOrbit(points);
        const observedAtMs = Date.parse(HORIZONS_SNAPSHOT.observedAt);
        for (const timestamp of [
          observedAtMs - 180 * 86_400_000,
          observedAtMs,
          observedAtMs + 180 * 86_400_000,
        ]) {
          const current = ephemerisScenePosition(
            vector,
            HORIZONS_SNAPSHOT.observedAt,
            timestamp,
            mode,
          );
          expect(distanceToOrbitPath(current, points)).toBeLessThan(
            diagnostics.boundsRadius * 0.002,
          );
        }
      }
    }
  });

  it("keeps every featured moon path smooth, including eccentric Nereid", () => {
    for (const moon of FEATURED_MOONS) {
      const parentRadius = 1;
      const orbitDistance = moonOrbitDistanceScene(
        moon,
        parentRadius,
        1_000,
        "exploration",
      );
      const points = moonOrbitPoints(moon, orbitDistance, 128);
      const diagnostics = expectWellFormedOrbit(points);
      for (const timestamp of REPRESENTATIVE_TIMESTAMPS_MS) {
        const current = moonLocalPositionAt(moon, timestamp, orbitDistance);
        expect(distanceToOrbitPath(current, points)).toBeLessThan(
          diagnostics.boundsRadius * 0.003,
        );
      }
    }
  });

  it("keeps every asteroid, dwarf/Kuiper object and comet path smooth", () => {
    for (const body of EXTENDED_BODIES) {
      for (const mode of ["exploration", "scientific"] as const) {
        const points = extendedOrbitPoints(body, mode, 192);
        const diagnostics = expectWellFormedOrbit(points);
        for (const timestamp of REPRESENTATIVE_TIMESTAMPS_MS) {
          const current = extendedBodyPosition(body, timestamp, mode);
          expect(distanceToOrbitPath(current, points)).toBeLessThan(
            diagnostics.boundsRadius * 0.003,
          );
        }
      }
    }
  });

  it("uses Kepler timing and smooth geometry for every dwarf-system satellite", () => {
    for (const moon of DWARF_SATELLITES) {
      const parentMeanRadiusKm = 1_000;
      const parentRadius = 1;
      const orbitDistance = dwarfSatelliteOrbitDistance(
        moon,
        parentMeanRadiusKm,
        parentRadius,
        "exploration",
      );
      const points = dwarfSatelliteOrbitPoints(moon, orbitDistance, 96);
      const diagnostics = expectWellFormedOrbit(points);
      for (const timestamp of REPRESENTATIVE_TIMESTAMPS_MS) {
        const current = dwarfSatellitePositionAt(
          moon,
          timestamp,
          parentMeanRadiusKm,
          parentRadius,
          "exploration",
        );
        expect(distanceToOrbitPath(current, points)).toBeLessThan(
          diagnostics.boundsRadius * 0.005,
        );
      }
    }
  });
});
