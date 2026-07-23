export type ResampledOrbitPoint = readonly [number, number, number];

function distance(
  left: ResampledOrbitPoint,
  right: ResampledOrbitPoint,
): number {
  return Math.hypot(right[0] - left[0], right[1] - left[1], right[2] - left[2]);
}

/**
 * Re-samples a dense closed polyline at approximately equal rendered arc-length
 * intervals. This is intentionally applied after scene scaling: exploration
 * scale is non-linear, so uniform anomaly samples can otherwise turn the
 * perihelion region of highly eccentric comets into a few long straight chords.
 */
export function resampleClosedOrbitByArcLength(
  densePoints: readonly ResampledOrbitPoint[],
  segments: number,
): readonly ResampledOrbitPoint[] {
  const safeSegments = Math.max(24, Math.round(segments));
  if (densePoints.length < 3) return densePoints;

  const first = densePoints[0] ?? [0, 0, 0];
  const last = densePoints.at(-1) ?? first;
  const closureError = distance(first, last);
  const closed =
    closureError <=
    Math.max(
      1e-12,
      Math.max(Math.hypot(...first), Math.hypot(...last)) * 1e-12,
    );
  const source = closed
    ? [...densePoints]
    : [...densePoints, [first[0], first[1], first[2]] as const];

  const cumulative = [0];
  for (let index = 1; index < source.length; index += 1) {
    cumulative.push(
      (cumulative[index - 1] ?? 0) +
        distance(source[index - 1] ?? first, source[index] ?? first),
    );
  }
  const totalLength = cumulative.at(-1) ?? 0;
  if (!(totalLength > 0) || !Number.isFinite(totalLength)) {
    return [first, [first[0], first[1], first[2]]];
  }

  const result: [number, number, number][] = [];
  let sourceIndex = 1;
  for (let index = 0; index < safeSegments; index += 1) {
    const targetDistance = (index / safeSegments) * totalLength;
    while (
      sourceIndex < cumulative.length - 1 &&
      (cumulative[sourceIndex] ?? 0) < targetDistance
    ) {
      sourceIndex += 1;
    }
    const beforeIndex = Math.max(0, sourceIndex - 1);
    const beforeDistance = cumulative[beforeIndex] ?? 0;
    const afterDistance = cumulative[sourceIndex] ?? totalLength;
    const span = Math.max(1e-15, afterDistance - beforeDistance);
    const t = Math.max(
      0,
      Math.min(1, (targetDistance - beforeDistance) / span),
    );
    const before = source[beforeIndex] ?? first;
    const after = source[sourceIndex] ?? first;
    result.push([
      before[0] + (after[0] - before[0]) * t,
      before[1] + (after[1] - before[1]) * t,
      before[2] + (after[2] - before[2]) * t,
    ]);
  }
  const resultFirst = result[0] ?? [first[0], first[1], first[2]];
  result.push([resultFirst[0], resultFirst[1], resultFirst[2]]);
  return result;
}
