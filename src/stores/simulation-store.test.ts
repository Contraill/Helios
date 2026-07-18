import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SECONDS_PER_JULIAN_YEAR } from "@/features/solar-system/types/experience-settings";

import {
  currentSimulationTimeMs,
  resetSimulationStore,
  useSimulationStore,
} from "./simulation-store";

function state() {
  return useSimulationStore.getState();
}

describe("simulation store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T00:00:00.000Z"));
    localStorage.clear();
    resetSimulationStore(Date.now());
  });

  afterEach(() => vi.useRealTimers());

  it("starts in real time, pauses, changes speed and resets to real time", () => {
    const initialVersion = state().resetVersion;
    expect(state().isPaused).toBe(false);
    state().togglePaused();
    state().setTimeScale(86_400);

    expect(state().isPaused).toBe(true);
    expect(state().timeScale).toBe(86_400);

    state().resetSimulation();
    expect(state().isPaused).toBe(false);
    expect(state().timeScale).toBe(1);
    expect(state().resetVersion).toBe(initialVersion + 1);
  });

  it("rehydrates the persisted time speed without persisting pause or range", async () => {
    useSimulationStore.setState({ isPaused: true });
    localStorage.setItem(
      "helios-simulation",
      JSON.stringify({ state: { timeScale: 4 }, version: 1 }),
    );

    await useSimulationStore.persist.rehydrate();

    expect(state().timeScale).toBe(1);
    expect(state().isPaused).toBe(true);
    expect(new Date(state().range.anchorUtcMs).toISOString()).toBe(
      "2026-07-18T00:00:00.000Z",
    );
  });

  it("uses one central clock for date navigation, speed and pause", () => {
    state().setSimulationTime(Date.now());

    vi.advanceTimersByTime(1_000);
    expect(new Date(currentSimulationTimeMs(state())).toISOString()).toBe(
      "2026-07-18T00:00:01.000Z",
    );

    state().setTimeScale(21_600);
    vi.advanceTimersByTime(1_000);
    expect(new Date(currentSimulationTimeMs(state())).toISOString()).toBe(
      "2026-07-18T06:00:01.000Z",
    );

    state().togglePaused();
    const pausedAt = state().simulationAtMs;
    vi.advanceTimersByTime(10_000);
    expect(state().simulationAtMs).toBe(pausedAt);

    state().stepSimulationDays(-30);
    expect(state().simulationAtMs).toBe(pausedAt - 30 * 86_400_000);
  });

  it("advances by one Julian year per real second", () => {
    const start = Date.now();
    state().setTimeScale(SECONDS_PER_JULIAN_YEAR);

    vi.advanceTimersByTime(1_000);
    expect(currentSimulationTimeMs(state())).toBe(
      start + SECONDS_PER_JULIAN_YEAR * 1_000,
    );
  });

  it("clamps max minus 500 ms at month speed and pauses exactly at maximum", () => {
    const { maximumUtcMs } = state().range;
    state().setSimulationTime(maximumUtcMs - 500);
    state().setTimeScale(2_592_000);

    vi.advanceTimersByTime(1_000);
    expect(state().syncSimulationClock()).toBe(maximumUtcMs);
    expect(state().simulationAtMs).toBe(maximumUtcMs);
    expect(state().isPaused).toBe(true);
    expect(state().boundaryReached).toBe("maximum");

    vi.advanceTimersByTime(10_000);
    expect(state().syncSimulationClock()).toBe(maximumUtcMs);
  });

  it("clamps a backward day step at minimum", () => {
    const { minimumUtcMs } = state().range;
    state().setSimulationTime(minimumUtcMs + 12 * 60 * 60 * 1_000);
    state().stepSimulationDays(-1);

    expect(state().simulationAtMs).toBe(minimumUtcMs);
    expect(state().isPaused).toBe(true);
    expect(state().boundaryReached).toBe("minimum");
  });

  it("reanchors Now from the current real UTC instant", () => {
    vi.setSystemTime(new Date("2026-07-19T03:04:05.000Z"));
    state().resetSimulation();

    expect(new Date(state().range.anchorUtcMs).toISOString()).toBe(
      "2026-07-19T03:04:05.000Z",
    );
    expect(state().simulationAtMs).toBe(Date.now());
  });
});
