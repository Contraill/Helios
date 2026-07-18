export const PAST_CALENDAR_YEARS = 500;
export const FUTURE_CALENDAR_YEARS = 600;

export interface SimulationRange {
  readonly anchorUtcMs: number;
  readonly minimumUtcMs: number;
  readonly maximumUtcMs: number;
}

export type SimulationBoundary = "minimum" | "maximum";

function finiteTimestamp(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Simulation timestamp must be finite.");
  }
  return value;
}

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Adds whole UTC calendar years while preserving month, time and, when valid,
 * day. A leap-day that does not exist in the target year clamps to the final
 * valid day of February.
 */
export function addCalendarYearsSafely(
  timestamp: number,
  years: number,
): number {
  finiteTimestamp(timestamp);
  if (!Number.isInteger(years)) {
    throw new RangeError("Calendar-year steps must be whole numbers.");
  }

  const source = new Date(timestamp);
  const targetYear = source.getUTCFullYear() + years;
  const month = source.getUTCMonth();
  const day = Math.min(source.getUTCDate(), daysInUtcMonth(targetYear, month));

  return Date.UTC(
    targetYear,
    month,
    day,
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds(),
  );
}

export function createSimulationRange(
  anchorUtc: number | Date,
): SimulationRange {
  const anchorUtcMs = finiteTimestamp(
    anchorUtc instanceof Date ? anchorUtc.getTime() : anchorUtc,
  );
  return Object.freeze({
    anchorUtcMs,
    minimumUtcMs: addCalendarYearsSafely(anchorUtcMs, -PAST_CALENDAR_YEARS),
    maximumUtcMs: addCalendarYearsSafely(anchorUtcMs, FUTURE_CALENDAR_YEARS),
  });
}

export function clampSimulationTimestamp(
  timestamp: number,
  range: SimulationRange,
): number {
  return Math.min(
    range.maximumUtcMs,
    Math.max(range.minimumUtcMs, finiteTimestamp(timestamp)),
  );
}

export function isWithinSimulationRange(
  timestamp: number,
  range: SimulationRange,
): boolean {
  return (
    Number.isFinite(timestamp) &&
    timestamp >= range.minimumUtcMs &&
    timestamp <= range.maximumUtcMs
  );
}

export function simulationBoundaryAt(
  timestamp: number,
  range: SimulationRange,
): SimulationBoundary | null {
  if (timestamp <= range.minimumUtcMs) return "minimum";
  if (timestamp >= range.maximumUtcMs) return "maximum";
  return null;
}
