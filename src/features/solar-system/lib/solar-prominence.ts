import { QuadraticBezierCurve3, Vector3 } from "three";

export interface SolarProminenceShape {
  readonly anchorRadius: number;
  readonly lift: number;
  readonly spanRadians: number;
}

function smoothstep(start: number, end: number, value: number): number {
  const normalized = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return normalized * normalized * (3 - 2 * normalized);
}

/**
 * A deterministic emergence/decay envelope. The loop spends most of its cycle
 * visible, while the short dark interval prevents every prominence from
 * reading as a permanently welded tube.
 */
export function solarProminenceEnvelope(
  elapsedSeconds: number,
  phase: number,
  cycleSeconds: number,
): number {
  if (
    !Number.isFinite(elapsedSeconds) ||
    !Number.isFinite(phase) ||
    !Number.isFinite(cycleSeconds) ||
    cycleSeconds <= 0
  ) {
    throw new RangeError("Solar prominence timing values must be finite.");
  }

  const normalized = (((elapsedSeconds / cycleSeconds + phase) % 1) + 1) % 1;
  const emerge = smoothstep(0.02, 0.16, normalized);
  const decay = 1 - smoothstep(0.76, 0.98, normalized);
  return Math.min(emerge, decay);
}

/**
 * Builds a prominence loop whose two anchors intersect the solar surface while
 * its midpoint rises above the corona. Unlike a torus segment, the curve does
 * not remain at one constant radius, so the loop cannot appear detached.
 */
export function createSolarProminenceCurve({
  anchorRadius,
  lift,
  spanRadians,
}: SolarProminenceShape): QuadraticBezierCurve3 {
  const halfSpan = spanRadians / 2;
  const start = new Vector3(
    Math.cos(-halfSpan) * anchorRadius,
    Math.sin(-halfSpan) * anchorRadius,
    0,
  );
  const end = new Vector3(
    Math.cos(halfSpan) * anchorRadius,
    Math.sin(halfSpan) * anchorRadius,
    0,
  );
  const endpointX = Math.cos(halfSpan) * anchorRadius;
  // Quadratic Bézier midpoint = 0.25 * start + 0.5 * control +
  // 0.25 * end. Solve the control point so `lift` is the actual apex
  // height above the surface rather than an opaque control-point offset.
  const controlX = 2 * (anchorRadius + lift) - endpointX;
  const control = new Vector3(controlX, 0, 0);
  return new QuadraticBezierCurve3(start, control, end);
}
