import {
  createSimulationRange,
  isWithinSimulationRange,
  type SimulationRange,
} from "@/features/solar-system/lib/simulation-range";

const MAXIMUM_ANCHOR_SKEW_MS = 24 * 60 * 60 * 1_000;

export function requestRangeFrom(
  anchorValue: string | null,
  realNowMs = Date.now(),
): SimulationRange {
  const requestedAnchor = anchorValue ? Date.parse(anchorValue) : Number.NaN;
  const anchorUtcMs =
    Number.isFinite(requestedAnchor) &&
    Math.abs(requestedAnchor - realNowMs) <= MAXIMUM_ANCHOR_SKEW_MS
      ? requestedAnchor
      : realNowMs;
  return createSimulationRange(anchorUtcMs);
}

export function requestedDateFrom(
  value: string | null,
  range = createSimulationRange(Date.now()),
): Date | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!isWithinSimulationRange(timestamp, range)) return null;
  return new Date(timestamp);
}
