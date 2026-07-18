import { beforeEach, describe, expect, it } from "vitest";

import {
  initialExplorationState,
  resetExplorationStore,
  useExplorationStore,
} from "./exploration-store";

function state() {
  return useExplorationStore.getState();
}

describe("exploration store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
  });

  it("starts in exploration overview with visible scene layers", () => {
    expect(state().selectedBodyId).toBeNull();
    expect(state().selectedPlanetId).toBeNull();
    expect(state().cameraMode).toBe("overview");
    expect(state().scaleMode).toBe("exploration");
    expect(state().orbitsVisible).toBe(true);
    expect(state().labelsVisible).toBe(true);
  });

  it("moves into transition mode when a planet is selected or cleared", () => {
    state().selectPlanet("mars");
    expect(state().selectedBodyId).toBe("mars");
    expect(state().selectedPlanetId).toBe("mars");
    expect(state().cameraMode).toBe("transition");

    state().settleCamera("mars", "focus");
    expect(state().cameraMode).toBe("focus");

    state().clearSelection();
    expect(state().selectedPlanetId).toBeNull();
    expect(state().cameraMode).toBe("transition");
  });

  it("selects the Sun as a first-class focus target without inventing a planet id", () => {
    state().selectSun();
    expect(state().selectedBodyId).toBe("sun");
    expect(state().selectedPlanetId).toBeNull();
    expect(state().cameraMode).toBe("transition");

    state().settleCamera("sun", "focus");
    expect(state().cameraMode).toBe("focus");

    state().clearSelection();
    expect(state().selectedBodyId).toBeNull();
  });

  it("hands camera authority to free controls and returns safely", () => {
    state().selectPlanet("earth");
    state().settleCamera("earth", "focus");
    state().enterFreeCamera();
    expect(state().cameraMode).toBe("free");
    expect(state().selectedPlanetId).toBe("earth");

    state().exitFreeCamera();
    expect(state().cameraMode).toBe("transition");
    expect(state().selectedPlanetId).toBe("earth");

    state().enterFreeCamera();
    state().clearSelection();
    expect(state().cameraMode).toBe("transition");
    expect(state().selectedPlanetId).toBeNull();
  });

  it("ignores a stale camera completion after a rapid selection change", () => {
    state().selectPlanet("mars");
    state().selectPlanet("venus");

    state().settleCamera("mars", "focus");
    expect(state().selectedPlanetId).toBe("venus");
    expect(state().cameraMode).toBe("transition");

    state().settleCamera("venus", "focus");
    expect(state().cameraMode).toBe("focus");
  });

  it("only clears the planet that currently owns hover state", () => {
    state().setHoveredPlanet("earth");
    state().clearHoveredPlanet("mars");
    expect(state().hoveredPlanetId).toBe("earth");

    state().clearHoveredPlanet("earth");
    expect(state().hoveredPlanetId).toBeNull();
  });

  it("uses the same hover ownership contract for the Sun", () => {
    state().setHoveredBody("sun");
    expect(state().hoveredBodyId).toBe("sun");
    expect(state().hoveredPlanetId).toBeNull();

    state().clearHoveredBody("earth");
    expect(state().hoveredBodyId).toBe("sun");

    state().clearHoveredBody("sun");
    expect(state().hoveredBodyId).toBeNull();
  });

  it("persists scale and scene layers without restoring selection", async () => {
    useExplorationStore.setState({
      ...initialExplorationState,
      selectedPlanetId: "mars",
    });
    localStorage.setItem(
      "helios-exploration",
      JSON.stringify({
        state: {
          scaleMode: "scientific",
          orbitsVisible: false,
          labelsVisible: false,
        },
        version: 1,
      }),
    );

    await useExplorationStore.persist.rehydrate();

    expect(state().scaleMode).toBe("scientific");
    expect(state().orbitsVisible).toBe(false);
    expect(state().labelsVisible).toBe(false);
    expect(state().selectedPlanetId).toBe("mars");
  });
});
