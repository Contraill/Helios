"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import {
  captureSceneFrameTime,
  clearSceneFrameTime,
  SCENE_FRAME_PRIORITY,
} from "@/features/solar-system/lib/scene-frame-runtime";
import { useSimulationStore } from "@/stores/simulation-store";

export function SimulationFrameClock() {
  const invalidate = useThree((state) => state.invalidate);
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const clockAnchorRealMs = useSimulationStore(
    (state) => state.clockAnchorRealMs,
  );
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);

  useEffect(() => clearSceneFrameTime, []);

  // Demand-mode canvases do not redraw just because the external simulation
  // store changed. Force one frame whenever an explicit clock mutation occurs
  // so bodies and test instrumentation observe the exact same timestamp.
  useEffect(() => {
    clearSceneFrameTime();
    invalidate();
  }, [clockAnchorRealMs, invalidate, isPaused, simulationAtMs, timeScale]);

  useFrame(() => {
    captureSceneFrameTime();
  }, SCENE_FRAME_PRIORITY.clock);
  return null;
}
