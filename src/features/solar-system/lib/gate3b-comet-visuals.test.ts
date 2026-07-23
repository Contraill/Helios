import { describe, expect, it } from "vitest";

import {
  EXTENDED_BODIES,
  cometTailState,
  extendedBodyPhysicalPositionAu,
} from "./extended-system";
import { visualProfileFor } from "./celestial-visual-registry";

const comets = EXTENDED_BODIES.filter(({ kind }) => kind === "comet");
const DAY_MS = 86_400_000;
const UNIX_EPOCH_JULIAN_DATE = 2_440_587.5;

function epochMs(comet: (typeof comets)[number]): number {
  return (comet.elements.epochJulianDateTdb - UNIX_EPOCH_JULIAN_DATE) * DAY_MS;
}

function dot(a: readonly number[], b: readonly number[]): number {
  const al = Math.hypot(...a);
  const bl = Math.hypot(...b);
  return (
    a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0) /
    Math.max(1e-12, al * bl)
  );
}

describe("Gate 3B comet visuals", () => {
  it("defines six complete nucleus, coma and dual-tail profiles", () => {
    expect(comets).toHaveLength(6);
    for (const comet of comets) {
      const visual = visualProfileFor(comet.id);
      expect(visual.category).toBe("comet");
      expect(visual.comet).toBeDefined();
      expect(visual.comet!.dustLength).toBeGreaterThan(0);
      expect(visual.comet!.ionLength).toBeGreaterThan(visual.comet!.dustLength);
      expect(visual.comet!.dustWidth).toBeGreaterThan(0);
      expect(visual.comet!.ionWidth).toBeGreaterThan(0);
    }
  });

  it("keeps every active tail anti-solar at multiple shared timestamps", () => {
    for (const comet of comets) {
      const timestamps = [
        epochMs(comet),
        epochMs(comet) + comet.elements.orbitalPeriodDays * 0.37 * DAY_MS,
      ];
      for (const timestamp of timestamps) {
        const position = extendedBodyPhysicalPositionAu(
          comet,
          timestamp,
        ).position;
        const tail = cometTailState(comet, timestamp);
        expect(dot(tail.antiSolarDirection, position)).toBeGreaterThan(0.995);
        expect(Number.isFinite(tail.heliocentricDistanceAu)).toBe(true);
        expect(tail.activity).toBeGreaterThanOrEqual(0);
        expect(tail.activity).toBeLessThanOrEqual(1);
      }
    }
  });

  it("reduces activity as the nucleus moves far from the Sun", () => {
    for (const comet of comets) {
      const samples = Array.from({ length: 48 }, (_, index) => {
        const timestamp =
          epochMs(comet) +
          (index / 48) * comet.elements.orbitalPeriodDays * DAY_MS;
        return cometTailState(comet, timestamp);
      });
      const nearest = samples.reduce((a, b) =>
        a.heliocentricDistanceAu < b.heliocentricDistanceAu ? a : b,
      );
      const farthest = samples.reduce((a, b) =>
        a.heliocentricDistanceAu > b.heliocentricDistanceAu ? a : b,
      );
      expect(nearest.activity).toBeGreaterThanOrEqual(farthest.activity);
    }
  });
});
