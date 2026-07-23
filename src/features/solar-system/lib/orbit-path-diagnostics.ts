export type OrbitPoint = readonly [number, number, number];

export interface OrbitPathDiagnostics {
  readonly pointCount: number;
  readonly finite: boolean;
  readonly closed: boolean;
  readonly closureError: number;
  readonly boundsRadius: number;
  readonly minRadius: number;
  readonly maxRadius: number;
  readonly minSegmentLength: number;
  readonly medianSegmentLength: number;
  readonly maxSegmentLength: number;
  readonly maxToMedianSegmentRatio: number;
  readonly maxChordToBoundsRatio: number;
}

function distance(left: OrbitPoint, right: OrbitPoint): number {
  return Math.hypot(right[0] - left[0], right[1] - left[1], right[2] - left[2]);
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : (sorted[middle] ?? 0);
}

export function orbitPathDiagnostics(
  points: readonly OrbitPoint[],
): OrbitPathDiagnostics {
  const radii = points.map((point) => Math.hypot(...point));
  const segments = points
    .slice(1)
    .map((point, index) => distance(points[index] ?? point, point));
  const first = points[0] ?? [0, 0, 0];
  const last = points.at(-1) ?? first;
  const closureError = distance(first, last);
  const boundsRadius = Math.max(0, ...radii);
  const minSegmentLength = segments.length > 0 ? Math.min(...segments) : 0;
  const maxSegmentLength = Math.max(0, ...segments);
  const medianSegmentLength = median(segments.filter((value) => value > 0));
  return {
    pointCount: points.length,
    finite: points.every((point) => point.every(Number.isFinite)),
    closed: closureError <= Math.max(1e-9, boundsRadius * 1e-9),
    closureError,
    boundsRadius,
    minRadius: Math.min(...radii, 0),
    maxRadius: boundsRadius,
    minSegmentLength,
    medianSegmentLength,
    maxSegmentLength,
    maxToMedianSegmentRatio:
      medianSegmentLength > 0
        ? maxSegmentLength / medianSegmentLength
        : Number.POSITIVE_INFINITY,
    maxChordToBoundsRatio:
      boundsRadius > 0 ? maxSegmentLength / boundsRadius : 0,
  };
}

export function orbitPathDiagnosticsFromFlatPositions(
  positions: readonly number[],
): OrbitPathDiagnostics {
  const points: OrbitPoint[] = [];
  for (let index = 0; index + 2 < positions.length; index += 3) {
    points.push([
      positions[index] ?? 0,
      positions[index + 1] ?? 0,
      positions[index + 2] ?? 0,
    ]);
  }
  return orbitPathDiagnostics(points);
}

export function distanceToOrbitPath(
  point: OrbitPoint,
  path: readonly OrbitPoint[],
): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    const start = path[index - 1];
    const end = path[index];
    if (!start || !end) continue;
    const ab: OrbitPoint = [
      end[0] - start[0],
      end[1] - start[1],
      end[2] - start[2],
    ];
    const ap: OrbitPoint = [
      point[0] - start[0],
      point[1] - start[1],
      point[2] - start[2],
    ];
    const denominator = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
    const t =
      denominator > 0
        ? Math.max(
            0,
            Math.min(
              1,
              (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / denominator,
            ),
          )
        : 0;
    minimum = Math.min(
      minimum,
      Math.hypot(
        point[0] - (start[0] + ab[0] * t),
        point[1] - (start[1] + ab[1] * t),
        point[2] - (start[2] + ab[2] * t),
      ),
    );
  }
  return minimum;
}
