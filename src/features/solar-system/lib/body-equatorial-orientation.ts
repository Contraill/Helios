import { Matrix4, Quaternion, Vector3 } from "three";

import {
  PARENT_POLES_J2000,
  referenceBasis,
  referenceBasisToThree,
  type SupportedParentPoleId,
} from "./reference-frame-math";

export function parentEquatorialQuaternion(
  parentPlanetId: SupportedParentPoleId,
  target = new Quaternion(),
): Quaternion {
  if (!(parentPlanetId in PARENT_POLES_J2000)) return target.identity();
  const basis = referenceBasisToThree(
    referenceBasis("parent-equatorial-j2000", { parentPlanetId }),
  );
  const xAxis = new Vector3(...basis.x);
  const yAxis = new Vector3(...basis.z);
  const zAxis = new Vector3(...basis.y).multiplyScalar(-1);
  const matrix = new Matrix4().makeBasis(xAxis, yAxis, zAxis);
  return target.setFromRotationMatrix(matrix).normalize();
}
