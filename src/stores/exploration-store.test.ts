import { beforeEach, describe, expect, it } from "vitest";

import {
  resetExplorationStore,
  useExplorationStore,
} from "./exploration-store";

function state() {
  return useExplorationStore.getState();
}

describe("exploration store", () => {
  beforeEach(resetExplorationStore);

  it("starts in the overview without a selection", () => {
    expect(state().selectedPlanetId).toBeNull();
    expect(state().cameraMode).toBe("overview");
  });

  it("moves into transition mode when a planet is selected or cleared", () => {
    state().selectPlanet("mars");
    expect(state().selectedPlanetId).toBe("mars");
    expect(state().cameraMode).toBe("transition");

    state().settleCamera("mars", "focus");
    expect(state().cameraMode).toBe("focus");

    state().clearSelection();
    expect(state().selectedPlanetId).toBeNull();
    expect(state().cameraMode).toBe("transition");
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
});
