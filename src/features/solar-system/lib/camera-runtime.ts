import type { Object3D } from "three";

import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import type { CameraMode } from "@/stores/exploration-store";
import type { CameraTargetMetadata } from "@/features/solar-system/types/camera-target";

const targetMetadata = new WeakMap<Object3D, CameraTargetMetadata>();

export interface CameraRuntimeSnapshot {
  mode: CameraMode;
  selectedBodyId: CelestialBodyId | null;
  targetBodyId: CelestialBodyId | null;
  transitionVersion: number;
  position: [number, number, number];
  target: [number, number, number];
  distanceToTarget: number;
  minimumDistance: number;
  azimuth: number;
  polar: number;
  controlsEnabled: boolean;
  isDragging: boolean;
}

let runtimeSnapshot: CameraRuntimeSnapshot | null = null;

export function setCameraTargetMetadata(
  object: Object3D,
  metadata: CameraTargetMetadata,
): void {
  targetMetadata.set(object, metadata);
  object.userData.cameraTarget = metadata;
}

export function cameraTargetMetadataFor(
  object: Object3D | null | undefined,
): CameraTargetMetadata | null {
  if (!object) return null;
  return targetMetadata.get(object) ?? null;
}

export function updateCameraRuntimeSnapshot(
  snapshot: CameraRuntimeSnapshot,
): void {
  runtimeSnapshot = snapshot;
}

export function cameraRuntimeSnapshot(): CameraRuntimeSnapshot | null {
  return runtimeSnapshot;
}

export function clearCameraRuntimeSnapshot(): void {
  runtimeSnapshot = null;
}
