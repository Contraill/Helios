import { QuadraticBezierCurve3, Vector3 } from "three";

export interface SolarProminenceShape {
  readonly anchorRadius: number;
  readonly lift: number;
  readonly spanRadians: number;
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
