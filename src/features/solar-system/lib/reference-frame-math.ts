import type { OrbitalReferenceFrame } from "./celestial-representation";

export type MutableVector3 = [number, number, number];
export type Vector3Tuple = readonly [number, number, number];
export interface PoleDirection {
  readonly rightAscensionDeg: number;
  readonly declinationDeg: number;
}
export interface ReferenceBasis {
  /** Basis vectors expressed in J2000 ecliptic coordinates. */
  readonly x: Vector3Tuple;
  readonly y: Vector3Tuple;
  readonly z: Vector3Tuple;
}

export const J2000_OBLIQUITY_ARCSECONDS = 84_381.448;
export const J2000_OBLIQUITY_RADIANS =
  (J2000_OBLIQUITY_ARCSECONDS / 3600) * (Math.PI / 180);

const DEG_TO_RAD = Math.PI / 180;
const ICRF_NORTH: Vector3Tuple = [0, 0, 1];
const ICRF_X: Vector3Tuple = [1, 0, 0];

function length(vector: Vector3Tuple): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

export function normalizeVector(
  vector: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  const magnitude = length(vector);
  if (!Number.isFinite(magnitude) || magnitude < 1e-12) {
    target[0] = 0;
    target[1] = 1;
    target[2] = 0;
    return target;
  }
  target[0] = vector[0] / magnitude;
  target[1] = vector[1] / magnitude;
  target[2] = vector[2] / magnitude;
  return target;
}

export function crossVectors(
  left: Vector3Tuple,
  right: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  target[0] = left[1] * right[2] - left[2] * right[1];
  target[1] = left[2] * right[0] - left[0] * right[2];
  target[2] = left[0] * right[1] - left[1] * right[0];
  return target;
}

export function dotVectors(left: Vector3Tuple, right: Vector3Tuple): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

export function unitVectorFromRaDec(
  pole: PoleDirection,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  const ra = pole.rightAscensionDeg * DEG_TO_RAD;
  const dec = pole.declinationDeg * DEG_TO_RAD;
  const cosDec = Math.cos(dec);
  target[0] = cosDec * Math.cos(ra);
  target[1] = cosDec * Math.sin(ra);
  target[2] = Math.sin(dec);
  return normalizeVector(target, target);
}

export function icrfToEclipticJ2000(
  vector: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  const cosine = Math.cos(J2000_OBLIQUITY_RADIANS);
  const sine = Math.sin(J2000_OBLIQUITY_RADIANS);
  target[0] = vector[0];
  target[1] = cosine * vector[1] + sine * vector[2];
  target[2] = -sine * vector[1] + cosine * vector[2];
  return target;
}

export function eclipticJ2000ToIcrf(
  vector: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  const cosine = Math.cos(J2000_OBLIQUITY_RADIANS);
  const sine = Math.sin(J2000_OBLIQUITY_RADIANS);
  target[0] = vector[0];
  target[1] = cosine * vector[1] - sine * vector[2];
  target[2] = sine * vector[1] + cosine * vector[2];
  return target;
}

export function eclipticToThreeYUp(
  vector: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  target[0] = vector[0];
  target[1] = vector[2];
  target[2] = -vector[1];
  return target;
}

function planeBasisFromPoleIcrf(pole: Vector3Tuple): ReferenceBasis {
  const node = crossVectors(ICRF_NORTH, pole);
  if (length(node) < 1e-10) {
    node[0] = ICRF_X[0];
    node[1] = ICRF_X[1];
    node[2] = ICRF_X[2];
  }
  normalizeVector(node, node);
  const inPlaneY = normalizeVector(crossVectors(pole, node));
  const xEcliptic = icrfToEclipticJ2000(node);
  const yEcliptic = icrfToEclipticJ2000(inPlaneY);
  const zEcliptic = icrfToEclipticJ2000(pole);
  return {
    x: [xEcliptic[0], xEcliptic[1], xEcliptic[2]],
    y: [yEcliptic[0], yEcliptic[1], yEcliptic[2]],
    z: [zEcliptic[0], zEcliptic[1], zEcliptic[2]],
  };
}

export const ECLIPTIC_J2000_BASIS: ReferenceBasis = Object.freeze({
  x: [1, 0, 0] as const,
  y: [0, 1, 0] as const,
  z: [0, 0, 1] as const,
});

export const PARENT_POLES_J2000 = Object.freeze({
  mercury: { rightAscensionDeg: 281.0103, declinationDeg: 61.4155 },
  venus: { rightAscensionDeg: 272.76, declinationDeg: 67.16 },
  earth: { rightAscensionDeg: 0, declinationDeg: 90 },
  mars: { rightAscensionDeg: 317.68143, declinationDeg: 52.8865 },
  jupiter: { rightAscensionDeg: 268.056595, declinationDeg: 64.495303 },
  saturn: { rightAscensionDeg: 40.589, declinationDeg: 83.537 },
  uranus: { rightAscensionDeg: 257.311, declinationDeg: -15.175 },
  neptune: { rightAscensionDeg: 299.36, declinationDeg: 43.46 },
});

export type SupportedParentPoleId = keyof typeof PARENT_POLES_J2000;

export function referenceBasis(
  frame: OrbitalReferenceFrame,
  options: {
    parentPlanetId?: SupportedParentPoleId;
    laplacePole?: PoleDirection;
  } = {},
): ReferenceBasis {
  if (frame === "ecliptic-j2000") return ECLIPTIC_J2000_BASIS;
  if (frame === "icrf-j2000") {
    return planeBasisFromPoleIcrf(ICRF_NORTH);
  }
  const pole =
    frame === "local-laplace-plane"
      ? options.laplacePole
      : options.parentPlanetId
        ? PARENT_POLES_J2000[options.parentPlanetId]
        : undefined;
  if (!pole) {
    throw new Error(`Missing pole metadata for orbital frame ${frame}.`);
  }
  return planeBasisFromPoleIcrf(unitVectorFromRaDec(pole));
}

export function applyReferenceBasis(
  basis: ReferenceBasis,
  source: Vector3Tuple,
  target: MutableVector3 = [0, 0, 0],
): MutableVector3 {
  target[0] =
    basis.x[0] * source[0] + basis.y[0] * source[1] + basis.z[0] * source[2];
  target[1] =
    basis.x[1] * source[0] + basis.y[1] * source[1] + basis.z[1] * source[2];
  target[2] =
    basis.x[2] * source[0] + basis.y[2] * source[1] + basis.z[2] * source[2];
  return target;
}

export function referenceBasisToThree(basis: ReferenceBasis): ReferenceBasis {
  const x = eclipticToThreeYUp(basis.x);
  const y = eclipticToThreeYUp(basis.y);
  const z = eclipticToThreeYUp(basis.z);
  return {
    x: [x[0], x[1], x[2]],
    y: [y[0], y[1], y[2]],
    z: [z[0], z[1], z[2]],
  };
}
