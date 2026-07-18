"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";

import { SCENE_QUALITY } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";

import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SolarSystemScene } from "./solar-system-scene";

interface SolarSystemCanvasProps {
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

let cachedWebGLAvailability: boolean | null = null;

function subscribeToVisibility(onStoreChange: () => void): () => void {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function documentIsVisible(): boolean {
  return document.visibilityState === "visible";
}

export function SolarSystemCanvas({
  scenePlanets,
  sceneSun,
}: SolarSystemCanvasProps) {
  const motionPreference = usePreferencesStore(
    (state) => state.motionPreference,
  );
  const qualityLevel = usePreferencesStore((state) => state.qualityLevel);
  const reducedMotion = useReducedMotionPreference(motionPreference);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const enterFreeCamera = useExplorationStore((state) => state.enterFreeCamera);
  const hoveredPlanetId = useExplorationStore((state) => state.hoveredPlanetId);
  const quality = SCENE_QUALITY[qualityLevel];
  const copy = uiStrings.pages.explore;
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(
    cachedWebGLAvailability,
  );
  const documentVisible = useSyncExternalStore(
    subscribeToVisibility,
    documentIsVisible,
    () => false,
  );
  const continuousRendering = !reducedMotion && documentVisible;

  useEffect(() => {
    if (cachedWebGLAvailability !== null) return;
    const frame = window.requestAnimationFrame(() => {
      const probe = document.createElement("canvas");
      const context =
        probe.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
        probe.getContext("webgl", { failIfMajorPerformanceCaveat: false });
      cachedWebGLAvailability = Boolean(context);
      setWebglAvailable(cachedWebGLAvailability);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`solar-canvas-shell${hoveredPlanetId ? " solar-canvas-shell--interactive" : ""}`}
      data-camera-mode={cameraMode}
      data-bloom={
        quality.bloomStrength > 0 && !reducedMotion ? "enabled" : "disabled"
      }
      data-quality={qualityLevel}
      data-render-loop={continuousRendering ? "continuous" : "demand"}
      data-texture-variant={quality.textureVariant}
      onPointerDownCapture={(event) => {
        if (event.pointerType !== "mouse" || event.button === 0) {
          enterFreeCamera();
        }
      }}
      onWheelCapture={enterFreeCamera}
    >
      {webglAvailable === null ? (
        <div className="scene-loading" role="status">
          <span>{copy.loading}</span>
        </div>
      ) : webglAvailable ? (
        <SceneErrorBoundary fallback={<SceneFallback />}>
          <Canvas
            aria-hidden="true"
            camera={{ far: 6_200, fov: 46, near: 0.1, position: [0, 48, 90] }}
            dpr={quality.dpr}
            fallback={<SceneFallback />}
            frameloop={continuousRendering ? "always" : "demand"}
            gl={{
              alpha: false,
              antialias: qualityLevel !== "low",
              powerPreference:
                qualityLevel === "low" ? "low-power" : "high-performance",
            }}
            onPointerMissed={() => {
              if (useExplorationStore.getState().cameraMode !== "free") {
                clearSelection();
              }
            }}
          >
            <Suspense fallback={null}>
              <SolarSystemScene
                reducedMotion={reducedMotion}
                scenePlanets={scenePlanets}
                sceneSun={sceneSun}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      ) : (
        <SceneFallback />
      )}
      {reducedMotion ? (
        <p className="motion-notice" role="status">
          {copy.motionPaused}
        </p>
      ) : null}
    </div>
  );
}
