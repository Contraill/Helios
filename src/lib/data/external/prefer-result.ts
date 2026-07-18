import type { ExternalDataStatus, ExternalResult } from "./types";

const STATUS_PRIORITY: Readonly<Record<ExternalDataStatus, number>> = {
  current: 6,
  "near-live": 5,
  "latest-available": 5,
  historical: 4,
  stale: 2,
  fallback: 1,
  unavailable: 0,
};

export function preferFreshestResult<T>(
  ...results: readonly ExternalResult<T>[]
): ExternalResult<T> {
  const [first, ...rest] = results;
  if (!first) throw new RangeError("At least one external result is required.");

  return rest.reduce((preferred, candidate) => {
    const preferredHasData = preferred.data !== null;
    const candidateHasData = candidate.data !== null;
    if (candidateHasData !== preferredHasData) {
      return candidateHasData ? candidate : preferred;
    }
    return STATUS_PRIORITY[candidate.status] > STATUS_PRIORITY[preferred.status]
      ? candidate
      : preferred;
  }, first);
}
