"use client";

import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import { StarField } from "./star-field";

interface UniverseBackdropProps {
  motionEnabled: boolean;
  resetVersion: number;
  scaleMode: ScaleMode;
  starCount: number;
  starSize: number;
  timeScale: number;
}

/**
 * Gate 3A intentionally keeps only the local star field mounted. The previous
 * distance-faded Milky Way layer is held out of runtime until Gate 4 rebuilds
 * Galactic Context as a deliberate transition rather than an Oort backdrop.
 */
export function UniverseBackdrop({
  motionEnabled,
  resetVersion,
  scaleMode,
  starCount,
  starSize,
  timeScale,
}: UniverseBackdropProps) {
  return (
    <StarField
      motionEnabled={motionEnabled}
      resetVersion={resetVersion}
      scaleMode={scaleMode}
      starCount={starCount}
      starSize={starSize}
      timeScale={timeScale}
    />
  );
}
