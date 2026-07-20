"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";

import {
  markRendererUnavailable,
  useAssetLoadingSnapshot,
} from "@/features/solar-system/lib/asset-loading-lifecycle";
import { HIGH_VISUAL_CONTRACT } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";

import { ExploreOpeningLoader } from "./explore-opening-loader";
import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SecondaryAssetScheduler } from "./secondary-asset-scheduler";
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
  const reducedMotion = useReducedMotionPreference();
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const bootstrap = useAssetLoadingSnapshot();
  const profile = sceneProfileFor(scaleMode);
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

  useEffect(() => {
    if (webglAvailable === false) markRendererUnavailable();
  }, [webglAvailable]);

  return (
    <div
      className={`solar-canvas-shell${hoveredBodyId ? " solar-canvas-shell--interactive" : ""}`}
      data-body-profile={profile.scale.bodyProfile}
      data-bootstrap-ready={bootstrap.blockingReady}
      data-degraded-assets={bootstrap.degradedOwners.length}
      data-distance-profile={profile.scale.distanceProfile}
      data-camera-mode={cameraMode}
      data-render-loop={continuousRendering ? "continuous" : "demand"}
      data-scene-profile={profile.id}
      data-secondary-stage={bootstrap.secondaryStageStarted}
      data-visual-contract="high"
    >
      {webglAvailable === null ? (
        <div className="scene-loading" role="status">
          <span>{copy.loading}</span>
        </div>
      ) : webglAvailable ? (
        <SceneErrorBoundary fallback={<SceneFallback />}>
          <Canvas
            aria-hidden="true"
            camera={{
              far: 1_500_000,
              fov: 46,
              near: 0.000_000_1,
              position: [0, 48, 90],
            }}
            dpr={[...HIGH_VISUAL_CONTRACT.dpr]}
            fallback={<SceneFallback />}
            frameloop={continuousRendering ? "always" : "demand"}
            gl={{
              alpha: false,
              antialias: true,
              logarithmicDepthBuffer: true,
              powerPreference: "high-performance",
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
      <ExploreOpeningLoader />
      <SecondaryAssetScheduler />
    </div>
  );
}
