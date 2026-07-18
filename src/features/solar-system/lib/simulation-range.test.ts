import { describe, expect, it } from "vitest";

import {
  addCalendarYearsSafely,
  clampSimulationTimestamp,
  createSimulationRange,
  isWithinSimulationRange,
  simulationBoundaryAt,
} from "./simulation-range";

describe("simulation range", () => {
  it.each([
    [
      "2026-07-18T12:30:00.000Z",
      "1526-07-18T12:30:00.000Z",
      "2626-07-18T12:30:00.000Z",
    ],
    [
      "2026-07-19T12:30:00.000Z",
      "1526-07-19T12:30:00.000Z",
      "2626-07-19T12:30:00.000Z",
    ],
  ])(
    "creates a dynamic -500/+600 calendar-year range from %s",
    (anchor, minimum, maximum) => {
      const range = createSimulationRange(Date.parse(anchor));
      expect(new Date(range.minimumUtcMs).toISOString()).toBe(minimum);
      expect(new Date(range.maximumUtcMs).toISOString()).toBe(maximum);
    },
  );

  it("uses one documented leap-day clamp policy", () => {
    const leapDay = Date.parse("2024-02-29T08:15:10.123Z");
    expect(new Date(addCalendarYearsSafely(leapDay, 1)).toISOString()).toBe(
      "2025-02-28T08:15:10.123Z",
    );
    expect(new Date(addCalendarYearsSafely(leapDay, 4)).toISOString()).toBe(
      "2028-02-29T08:15:10.123Z",
    );
  });

  it("clamps both boundaries and reports exact membership", () => {
    const range = createSimulationRange(Date.parse("2026-07-18T00:00:00Z"));
    expect(clampSimulationTimestamp(range.minimumUtcMs - 1, range)).toBe(
      range.minimumUtcMs,
    );
    expect(clampSimulationTimestamp(range.maximumUtcMs + 1, range)).toBe(
      range.maximumUtcMs,
    );
    expect(isWithinSimulationRange(range.minimumUtcMs, range)).toBe(true);
    expect(isWithinSimulationRange(range.maximumUtcMs, range)).toBe(true);
    expect(isWithinSimulationRange(range.minimumUtcMs - 1, range)).toBe(false);
    expect(isWithinSimulationRange(range.maximumUtcMs + 1, range)).toBe(false);
    expect(simulationBoundaryAt(range.minimumUtcMs, range)).toBe("minimum");
    expect(simulationBoundaryAt(range.maximumUtcMs, range)).toBe("maximum");
  });
});
