"use client";

import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import { MilkyWayContext } from "./milky-way-context";
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
 * Local stars and Galactic Context are separate visual layers. The transition
 * collapses the Solar System into a labelled map marker; it never implies a
 * continuous physical scale between the orbit scene and the galaxy diagram.
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
    <>
      <StarField
        motionEnabled={motionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        starCount={starCount}
        starSize={starSize}
        timeScale={timeScale}
      />
      <MilkyWayContext
        motionEnabled={motionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        timeScale={timeScale}
      />
    </>
  );
}
