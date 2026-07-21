import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import type { RegionCameraPresentation } from "@/features/solar-system/lib/region-visual-policy";

export type CameraTargetKind = "body" | "system" | "region";

/** Stable camera framing metadata attached to a registered scene root. */
export interface CameraTargetMetadata {
  readonly bodyId: CelestialBodyId;
  readonly targetKind: CameraTargetKind;
  readonly renderRadius: number;
  readonly collisionRadius: number;
  readonly focusRadius: number;
  readonly systemExtent?: number;
  readonly regionPresentation?: RegionCameraPresentation;
}
