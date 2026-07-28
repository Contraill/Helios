import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

export const SCENE_FRAME_PRIORITY = Object.freeze({
  clock: -100,
  primaryBodies: -80,
  satellites: -70,
  camera: -60,
  backdrop: -50,
  visual: -40,
} as const);

let currentFrameSimulationTimeMs: number | null = null;

/**
 * Captures one shared simulation timestamp before any scene object moves.
 * Every body and the camera then observes the same instant for that renderer
 * frame, including at accelerated playback speeds.
 */
export function captureSceneFrameTime(realNowMs = Date.now()): number {
  currentFrameSimulationTimeMs = currentSimulationTimeMs(
    useSimulationStore.getState(),
    realNowMs,
  );
  return currentFrameSimulationTimeMs;
}

export function sceneFrameTimeMs(): number {
  return (
    currentFrameSimulationTimeMs ??
    currentSimulationTimeMs(useSimulationStore.getState())
  );
}

export function clearSceneFrameTime(): void {
  currentFrameSimulationTimeMs = null;
}
