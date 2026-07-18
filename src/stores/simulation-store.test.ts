import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  currentSimulationTimeMs,
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

  afterEach(() => vi.useRealTimers());

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

  it("uses one central clock for date navigation, speed and pause", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T00:00:00.000Z"));
    state().setSimulationTime(Date.now());

    vi.advanceTimersByTime(1_000);
    expect(new Date(currentSimulationTimeMs(state())).toISOString()).toBe(
      "2026-07-18T06:00:00.000Z",
    );

    state().togglePaused();
    const pausedAt = state().simulationAtMs;
    vi.advanceTimersByTime(10_000);
    expect(state().simulationAtMs).toBe(pausedAt);

    state().stepSimulationDays(-30);
    expect(state().simulationAtMs).toBe(pausedAt - 30 * 86_400_000);
  });
});
