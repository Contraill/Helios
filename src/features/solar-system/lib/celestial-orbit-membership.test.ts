import { describe, expect, it } from "vitest";

import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";
import {
  createEphemerisScenePositionEvaluator,
  ephemerisOrbitScenePoints,
} from "@/lib/data/ephemeris/positions";

import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";
import {
  dwarfSatelliteOrbitPoints,
  dwarfSatellitePositionAt,
} from "./dwarf-satellite-position";
import { dwarfSatelliteOrbitDistance } from "./dwarf-satellite-scene-metrics";
import {
  EXTENDED_BODIES,
  extendedBodyPosition,
  extendedOrbitPoints,
} from "./extended-system";
import { FEATURED_MOONS } from "./moon-catalogue";
import { moonLocalPositionAt, moonOrbitPoints } from "./moon-position";
import {
  distanceToOrbitPath,
  orbitPathDiagnostics,
  type OrbitPoint,
} from "./orbit-path-diagnostics";

const DAY_MS = 86_400_000;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const UNIX_EPOCH_JULIAN_DATE = 2_440_587.5;

function expectOnRenderedOrbit(
  position: OrbitPoint,
  path: readonly OrbitPoint[],
): void {
  const diagnostics = orbitPathDiagnostics(path);
  const tolerance = diagnostics.maxSegmentLength * 0.58 + 1e-8;
  expect(position.every(Number.isFinite)).toBe(true);
  expect(diagnostics.finite).toBe(true);
  expect(diagnostics.closed).toBe(true);
  expect(distanceToOrbitPath(position, path)).toBeLessThanOrEqual(tolerance);
}

describe("catalogue-wide body and orbit membership", () => {
  it("keeps all eight planets on the orbit path used by the renderer", () => {
    for (const mode of ["exploration", "scientific"] as const) {
      for (const vector of HORIZONS_SNAPSHOT.vectors) {
        const path = ephemerisOrbitScenePoints(vector, mode, 384);
        const evaluate = createEphemerisScenePositionEvaluator(
          vector,
          HORIZONS_SNAPSHOT.observedAt,
          mode,
          true,
        );
        for (const days of [0, 37, 181, 720]) {
          expectOnRenderedOrbit(
            evaluate(
              Date.parse(HORIZONS_SNAPSHOT.observedAt) + days * DAY_MS,
              [0, 0, 0],
            ),
            path,
          );
        }
      }
    }
  });

  it("keeps all 22 featured moons on their parent-local paths", () => {
    for (const moon of FEATURED_MOONS) {
      const semiMajorAxisScene = 3;
      const path = moonOrbitPoints(moon, semiMajorAxisScene, 256);
      const epochMs =
        (moon.representation.epoch.julianDate - UNIX_EPOCH_JULIAN_DATE) *
        DAY_MS;
      for (const periodFraction of [0, 0.19, 0.51, 0.83]) {
        expectOnRenderedOrbit(
          moonLocalPositionAt(
            moon,
            epochMs + moon.orbitalPeriodDays * periodFraction * DAY_MS,
            semiMajorAxisScene,
          ),
          path,
        );
      }
    }
  });

  it("keeps every dwarf-system satellite on its parent-local path", () => {
    for (const mode of ["exploration", "scientific"] as const) {
      for (const moon of DWARF_SATELLITES) {
        const parentMeanRadiusKm = 1_000;
        const parentRadius = 1;
        const orbitDistance = dwarfSatelliteOrbitDistance(
          moon,
          parentMeanRadiusKm,
          parentRadius,
          mode,
        );
        const path = dwarfSatelliteOrbitPoints(moon, orbitDistance, 256);
        for (const periodFraction of [0, 0.23, 0.57, 0.88]) {
          expectOnRenderedOrbit(
            dwarfSatellitePositionAt(
              moon,
              J2000_MS + moon.orbitalPeriodDays * periodFraction * DAY_MS,
              parentMeanRadiusKm,
              parentRadius,
              mode,
            ),
            path,
          );
        }
      }
    }
  });

  it("keeps every asteroid, dwarf/Kuiper world and comet on its rendered path", () => {
    for (const mode of ["exploration", "scientific"] as const) {
      for (const body of EXTENDED_BODIES) {
        const path = extendedOrbitPoints(body, mode, 384);
        const epochMs =
          (body.elements.epochJulianDateTdb - UNIX_EPOCH_JULIAN_DATE) * DAY_MS;
        for (const periodFraction of [0, 0.17, 0.43, 0.79]) {
          expectOnRenderedOrbit(
            extendedBodyPosition(
              body,
              epochMs +
                body.elements.orbitalPeriodDays * periodFraction * DAY_MS,
              mode,
            ),
            path,
          );
        }
      }
    }
  });
});
