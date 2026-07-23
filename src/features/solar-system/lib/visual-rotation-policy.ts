import { Quaternion, Vector3 } from "three";

export type VisualRotationProfile =
  | {
      readonly kind: "periodic";
      readonly periodHours: number;
      readonly retrograde: boolean;
      readonly epochMs: number;
      readonly sourceId: string;
    }
  | {
      readonly kind: "tidally-locked";
      readonly sourceId: string;
    }
  | {
      readonly kind: "fixed-unknown";
      readonly sourceId: string;
      readonly note: string;
    };

const TAU = Math.PI * 2;
const HOUR_MS = 3_600_000;
const Y_AXIS = new Vector3(0, 1, 0);

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function visualRotationAngleAt(
  rotation: VisualRotationProfile,
  timestampMs: number,
): number {
  if (rotation.kind !== "periodic") return 0;
  const periodMs = rotation.periodHours * HOUR_MS;
  if (!Number.isFinite(periodMs) || periodMs <= 0) return 0;
  const phase =
    positiveModulo(timestampMs - rotation.epochMs, periodMs) / periodMs;
  return phase * TAU * (rotation.retrograde ? -1 : 1);
}

export function visualRotationQuaternionAt(
  rotation: VisualRotationProfile,
  timestampMs: number,
  target: Quaternion = new Quaternion(),
): Quaternion {
  return target.setFromAxisAngle(
    Y_AXIS,
    visualRotationAngleAt(rotation, timestampMs),
  );
}
