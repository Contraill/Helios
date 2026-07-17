import { beforeEach, describe, expect, it } from "vitest";

import {
  initialSimulationState,
  resetSimulationStore,
  useSimulationStore,
} from "./simulation-store";

function state() {
  return useSimulationStore.getState();
}

describe("simulation store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSimulationStore();
  });

  it("pauses, changes speed and returns to a deterministic reset state", () => {
    const initialVersion = state().resetVersion;
    state().togglePaused();
    state().setTimeScale(16);

    expect(state().isPaused).toBe(true);
    expect(state().timeScale).toBe(16);

    state().resetSimulation();
    expect(state().isPaused).toBe(false);
    expect(state().timeScale).toBe(1);
    expect(state().resetVersion).toBe(initialVersion + 1);
  });

  it("rehydrates the persisted time speed without persisting pause", async () => {
    useSimulationStore.setState({ ...initialSimulationState, isPaused: true });
    localStorage.setItem(
      "helios-simulation",
      JSON.stringify({ state: { timeScale: 4 }, version: 1 }),
    );

    await useSimulationStore.persist.rehydrate();

    expect(state().timeScale).toBe(4);
    expect(state().isPaused).toBe(true);
  });
});
