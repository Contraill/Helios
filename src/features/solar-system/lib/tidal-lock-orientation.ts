import { Matrix4, Quaternion, Vector3 } from "three";

export interface TidalLockScratch {
  readonly forward: Vector3;
  readonly right: Vector3;
  readonly up: Vector3;
  readonly fallback: Vector3;
  readonly matrix: Matrix4;
}

export function createTidalLockScratch(): TidalLockScratch {
  return {
    forward: new Vector3(),
    right: new Vector3(),
    up: new Vector3(),
    fallback: new Vector3(),
    matrix: new Matrix4(),
  };
}

/**
 * Builds a stable orientation whose local +Z axis faces the parent. The orbit
 * normal supplies the local +Y reference, so inclined and retrograde orbits do
 * not inherit an unrelated world-up axis. The helper makes no claim about a
 * texture's prime meridian.
 */
export function tidalLockQuaternion(
  moonLocalPosition: readonly [number, number, number],
  orbitNormal: readonly [number, number, number],
  target: Quaternion,
  scratch: TidalLockScratch,
): Quaternion {
  const forward = scratch.forward
    .set(-moonLocalPosition[0], -moonLocalPosition[1], -moonLocalPosition[2])
    .normalize();
  const up = scratch.up.set(...orbitNormal).normalize();
  const right = scratch.right.crossVectors(up, forward);

  if (right.lengthSq() < 1e-12) {
    const fallback = scratch.fallback;
    fallback.set(0, 1, 0);
    if (Math.abs(fallback.dot(forward)) > 0.98) fallback.set(1, 0, 0);
    right.crossVectors(fallback, forward);
  }

  right.normalize();
  up.crossVectors(forward, right).normalize();
  scratch.matrix.makeBasis(right, up, forward);
  return target.setFromRotationMatrix(scratch.matrix).normalize();
}
