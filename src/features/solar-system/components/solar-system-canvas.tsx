"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { SCENE_QUALITY } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";

import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SolarSystemScene } from "./solar-system-scene";

interface SolarSystemCanvasProps {
  scenePlanets: readonly ScenePlanet[];
}

export function SolarSystemCanvas({ scenePlanets }: SolarSystemCanvasProps) {
  const motionPreference = usePreferencesStore(
    (state) => state.motionPreference,
  );
  const qualityLevel = usePreferencesStore((state) => state.qualityLevel);
  const reducedMotion = useReducedMotionPreference(motionPreference);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const hoveredPlanetId = useExplorationStore((state) => state.hoveredPlanetId);
  const quality = SCENE_QUALITY[qualityLevel];
  const copy = uiStrings.pages.explore;

  return (
    <div
      className={`solar-canvas-shell${hoveredPlanetId ? " solar-canvas-shell--interactive" : ""}`}
      data-quality={qualityLevel}
    >
      <SceneErrorBoundary fallback={<SceneFallback />}>
        <Canvas
          aria-hidden="true"
          camera={{ far: 6_200, fov: 46, near: 0.1, position: [0, 48, 90] }}
          dpr={quality.dpr}
          fallback={<SceneFallback />}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{
            alpha: false,
            antialias: qualityLevel !== "low",
            powerPreference:
              qualityLevel === "low" ? "low-power" : "high-performance",
          }}
          onPointerMissed={clearSelection}
        >
          <Suspense fallback={null}>
            <SolarSystemScene
              reducedMotion={reducedMotion}
              scenePlanets={scenePlanets}
            />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
      {reducedMotion ? (
        <p className="motion-notice" role="status">
          {copy.motionPaused}
        </p>
      ) : null}
    </div>
  );
}
