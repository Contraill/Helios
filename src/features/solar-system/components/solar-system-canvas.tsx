"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";

import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SolarSystemScene } from "./solar-system-scene";

export function SolarSystemCanvas() {
  const reducedMotion = useReducedMotionPreference();
  const copy = uiStrings.pages.explore;

  return (
    <div className="solar-canvas-shell">
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
        >
          <Suspense fallback={null}>
            <SolarSystemScene motionEnabled={!reducedMotion} />
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
