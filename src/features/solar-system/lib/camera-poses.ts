import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

const MIN_FOCUS_DISTANCE = 4.1;
const RADIUS_DISTANCE_MULTIPLIER = 5.4;

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
}

export function overviewCameraPosition(
  width: number,
  height: number,
  scaleMode: ScaleMode = "exploration",
): readonly [number, number, number] {
  assertPositiveFinite(width, "Viewport width");
  assertPositiveFinite(height, "Viewport height");

  const aspect = width / height;
  const portrait = aspect < 0.85;

  if (scaleMode === "scientific") {
    const distance = portrait ? 1_060 : aspect < 1.2 ? 820 : 690;
    return [0, distance * (portrait ? 0.58 : 0.42), distance];
  }

  const distance = portrait ? 128 : aspect < 1.2 ? 108 : 90;
  return [0, distance * (portrait ? 0.74 : 0.52), distance];
}

export function focusCameraOffset(
  radius: number,
  aspect: number,
  scaleMode: ScaleMode = "exploration",
): readonly [number, number, number] {
  assertPositiveFinite(radius, "Planet radius");
  assertPositiveFinite(aspect, "Viewport aspect");

  const portraitMultiplier = aspect < 0.85 ? 1.28 : aspect < 1.2 ? 1.12 : 1;
  const minimumDistance = scaleMode === "scientific" ? 0 : MIN_FOCUS_DISTANCE;
  const distance =
    Math.max(minimumDistance, radius * RADIUS_DISTANCE_MULTIPLIER) *
    portraitMultiplier;

  return [distance * 0.48, distance * 0.24, distance];
}

export function illuminatedFocusCameraOffset(
  planetPosition: readonly [number, number, number],
  radius: number,
  aspect: number,
  scaleMode: ScaleMode = "exploration",
): readonly [number, number, number] {
  const canonicalOffset = focusCameraOffset(radius, aspect, scaleMode);
  const distance = Math.hypot(...canonicalOffset);
  const positionLength = Math.hypot(...planetPosition);

  if (positionLength < Number.EPSILON) return canonicalOffset;

  const sunwardX = -planetPosition[0] / positionLength;
  const sunwardY = -planetPosition[1] / positionLength;
  const sunwardZ = -planetPosition[2] / positionLength;
  const sideLength = Math.hypot(sunwardZ, sunwardX);
  const sideX = sideLength > Number.EPSILON ? sunwardZ / sideLength : 1;
  const sideZ = sideLength > Number.EPSILON ? -sunwardX / sideLength : 0;

  const viewX = sunwardX * 0.72 + sideX * 0.62;
  const viewY = sunwardY * 0.72 + 0.32;
  const viewZ = sunwardZ * 0.72 + sideZ * 0.62;
  const viewLength = Math.hypot(viewX, viewY, viewZ);

  return [
    (viewX / viewLength) * distance,
    (viewY / viewLength) * distance,
    (viewZ / viewLength) * distance,
  ];
}

export function transitionAlpha(
  deltaSeconds: number,
  reducedMotion: boolean,
): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
    throw new RangeError("Delta time must be a non-negative finite number.");
  }
  if (reducedMotion) return 1;
  return 1 - Math.exp(-5.8 * deltaSeconds);
}

export function cameraPoseHasSettled(
  positionDistanceSquared: number,
  targetDistanceSquared: number,
): boolean {
  if (
    !Number.isFinite(positionDistanceSquared) ||
    !Number.isFinite(targetDistanceSquared) ||
    positionDistanceSquared < 0 ||
    targetDistanceSquared < 0
  ) {
    throw new RangeError(
      "Camera distances must be non-negative finite values.",
    );
  }
  return positionDistanceSquared < 0.16 && targetDistanceSquared < 0.09;
}
