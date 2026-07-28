import { beforeEach, describe, expect, it } from "vitest";

import {
  captureSceneFrameTime,
  clearSceneFrameTime,
  SCENE_FRAME_PRIORITY,
  sceneFrameTimeMs,
} from "./scene-frame-runtime";
import {
  resetSimulationStore,
  useSimulationStore,
} from "@/stores/simulation-store";

describe("scene frame runtime", () => {
  beforeEach(() => {
    resetSimulationStore(1_000);
    clearSceneFrameTime();
  });

  it("orders movement before satellites, camera and visual sampling", () => {
    expect(SCENE_FRAME_PRIORITY.clock).toBeLessThan(
      SCENE_FRAME_PRIORITY.primaryBodies,
    );
    expect(SCENE_FRAME_PRIORITY.primaryBodies).toBeLessThan(
      SCENE_FRAME_PRIORITY.satellites,
    );
    expect(SCENE_FRAME_PRIORITY.satellites).toBeLessThan(
      SCENE_FRAME_PRIORITY.camera,
    );
    expect(SCENE_FRAME_PRIORITY.camera).toBeLessThan(
      SCENE_FRAME_PRIORITY.backdrop,
    );
  });

  it("publishes one stable simulation instant for the whole renderer frame", () => {
    useSimulationStore.getState().setTimeScale(86_400);
    const captured = captureSceneFrameTime(1_250);

    expect(sceneFrameTimeMs()).toBe(captured);
    expect(sceneFrameTimeMs()).toBe(captured);
  });
});
