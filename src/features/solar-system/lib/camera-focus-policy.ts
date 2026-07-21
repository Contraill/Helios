import type { SceneProfile } from "@/features/solar-system/lib/scene-profiles";
import type { CameraTargetMetadata } from "@/features/solar-system/types/camera-target";

const BODY_SAFETY_MULTIPLIER = 1.35;
const REGION_SAFETY_MULTIPLIER = 1.08;
const FRAME_PADDING = 1.22;

export interface CameraFocusPolicyInput {
  readonly aspect: number;
  readonly fovDegrees: number;
  readonly metadata: CameraTargetMetadata;
  readonly profile: SceneProfile;
}

export interface CameraFocusPolicyResult {
  readonly desiredDistance: number;
  readonly minimumDistance: number;
  readonly maximumDistance: number;
  readonly framingRadius: number;
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function safeHalfAngle(fovDegrees: number, aspect: number): number {
  const vertical = (positiveFinite(fovDegrees, 46) * Math.PI) / 360;
  const horizontal = Math.atan(Math.tan(vertical) * positiveFinite(aspect, 1));
  return Math.max(0.04, Math.min(vertical, horizontal));
}

export function cameraFocusPolicy({
  aspect,
  fovDegrees,
  metadata,
  profile,
}: CameraFocusPolicyInput): CameraFocusPolicyResult {
  const renderRadius = positiveFinite(metadata.renderRadius, 0.01);
  const collisionRadius = positiveFinite(
    metadata.collisionRadius,
    renderRadius,
  );
  const focusRadius = positiveFinite(metadata.focusRadius, renderRadius);
  const systemExtent = positiveFinite(metadata.systemExtent ?? 0, focusRadius);
  const framingRadius =
    metadata.targetKind === "region"
      ? Math.max(
          focusRadius,
          systemExtent,
          positiveFinite(
            metadata.regionPresentation?.framingExtent ?? 0,
            focusRadius,
          ),
        )
      : metadata.targetKind === "system"
        ? Math.max(focusRadius, systemExtent)
        : focusRadius;
  const safetyMultiplier =
    metadata.targetKind === "region"
      ? REGION_SAFETY_MULTIPLIER
      : BODY_SAFETY_MULTIPLIER;
  const profileFloor =
    profile.id === "scientific"
      ? Math.max(0.00005, profile.body.moonMinimumVisualRadius * 0.75)
      : Math.max(0.12, profile.camera.minimumDistance * 0.02);
  const minimumDistance = Math.max(
    collisionRadius * safetyMultiplier,
    profileFloor,
  );
  const fitDistance =
    (framingRadius / Math.sin(safeHalfAngle(fovDegrees, aspect))) *
    FRAME_PADDING;
  const maximumDistance = positiveFinite(
    profile.camera.maximumDistance,
    minimumDistance * 8,
  );
  const desiredDistance = Math.min(
    maximumDistance,
    Math.max(minimumDistance * 1.08, fitDistance),
  );

  return {
    desiredDistance,
    minimumDistance,
    maximumDistance,
    framingRadius,
  };
}

export function clampCameraDistance(
  distance: number,
  minimumDistance: number,
  maximumDistance: number,
): number {
  const min = positiveFinite(minimumDistance, 0.00005);
  const max = Math.max(min, positiveFinite(maximumDistance, min));
  if (!Number.isFinite(distance)) return min;
  return Math.min(max, Math.max(min, distance));
}
