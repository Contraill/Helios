"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";

import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SolarSystemScene } from "./solar-system-scene";

interface SolarSystemCanvasProps {
  scenePlanets: readonly ScenePlanet[];
}

export function SolarSystemCanvas({ scenePlanets }: SolarSystemCanvasProps) {
  const reducedMotion = useReducedMotionPreference();
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const hoveredPlanetId = useExplorationStore((state) => state.hoveredPlanetId);
  const copy = uiStrings.pages.explore;

  return (
    <div
      className={`solar-canvas-shell${hoveredPlanetId ? " solar-canvas-shell--interactive" : ""}`}
    >
      <SceneErrorBoundary fallback={<SceneFallback />}>
        <Canvas
          aria-hidden="true"
          camera={{ far: 320, fov: 46, near: 0.1, position: [0, 48, 90] }}
          dpr={[1, 1.5]}
          fallback={<SceneFallback />}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
          }}
          onPointerMissed={clearSelection}
        >
          <Suspense fallback={null}>
            <SolarSystemScene
              motionEnabled={!reducedMotion}
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
