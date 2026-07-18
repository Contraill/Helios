"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  clampSimulationTimestamp,
  createSimulationRange,
  simulationBoundaryAt,
  type SimulationBoundary,
  type SimulationRange,
} from "@/features/solar-system/lib/simulation-range";
import {
  isTimeScale,
  type TimeScale,
} from "@/features/solar-system/types/experience-settings";

const MILLISECONDS_PER_DAY = 86_400_000;

export interface SimulationState {
  isPaused: boolean;
  timeScale: TimeScale;
  resetVersion: number;
  simulationAtMs: number;
  clockAnchorRealMs: number;
  range: SimulationRange;
  boundaryReached: SimulationBoundary | null;
  initializeSimulationRange: (anchorUtcMs?: number) => void;
  syncSimulationClock: (realNowMs?: number) => number;
  togglePaused: () => void;
  setTimeScale: (timeScale: TimeScale) => void;
  setSimulationTime: (simulationAtMs: number) => void;
  stepSimulationDays: (days: number) => void;
  resetSimulation: () => void;
}

function stateAtNow(now = Date.now()) {
  return {
    isPaused: false,
    timeScale: 1 as TimeScale,
    resetVersion: 0,
    simulationAtMs: now,
    clockAnchorRealMs: now,
    range: createSimulationRange(now),
    boundaryReached: null as SimulationBoundary | null,
  };
}

export const initialSimulationState = stateAtNow();

function rawSimulationTimeMs(
  state: Pick<
    SimulationState,
    "clockAnchorRealMs" | "isPaused" | "simulationAtMs" | "timeScale"
  >,
  realNowMs: number,
): number {
  if (state.isPaused || state.clockAnchorRealMs === 0) {
    return state.simulationAtMs;
  }
  const elapsedRealMs = Math.max(0, realNowMs - state.clockAnchorRealMs);
  return state.simulationAtMs + elapsedRealMs * state.timeScale;
}

export function currentSimulationTimeMs(
  state: Pick<
    SimulationState,
    "clockAnchorRealMs" | "isPaused" | "range" | "simulationAtMs" | "timeScale"
  >,
  realNowMs = Date.now(),
): number {
  return clampSimulationTimestamp(
    rawSimulationTimeMs(state, realNowMs),
    state.range,
  );
}

function boundedClockState(
  state: SimulationState,
  requestedTimestamp: number,
  now: number,
) {
  const simulationAtMs = clampSimulationTimestamp(
    requestedTimestamp,
    state.range,
  );
  const boundaryReached = simulationBoundaryAt(simulationAtMs, state.range);
  return {
    simulationAtMs,
    clockAnchorRealMs: now,
    boundaryReached,
    isPaused: boundaryReached ? true : state.isPaused,
  };
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      ...initialSimulationState,
      initializeSimulationRange: (anchorUtcMs = Date.now()) =>
        set((state) => {
          const range = createSimulationRange(anchorUtcMs);
          return {
            range,
            simulationAtMs: anchorUtcMs,
            clockAnchorRealMs: anchorUtcMs,
            boundaryReached: null,
            isPaused: false,
            resetVersion: state.resetVersion + 1,
          };
        }),
      syncSimulationClock: (realNowMs = Date.now()) => {
        const state = useSimulationStore.getState();
        const raw = rawSimulationTimeMs(state, realNowMs);
        const current = clampSimulationTimestamp(raw, state.range);
        const boundaryReached = simulationBoundaryAt(current, state.range);
        if (boundaryReached && !state.isPaused) {
          set({
            simulationAtMs: current,
            clockAnchorRealMs: realNowMs,
            boundaryReached,
            isPaused: true,
          });
        }
        return current;
      },
      togglePaused: () =>
        set((state) => {
          if (state.isPaused && state.boundaryReached) return state;
          const now = Date.now();
          return {
            isPaused: !state.isPaused,
            simulationAtMs: currentSimulationTimeMs(state, now),
            clockAnchorRealMs: now,
            boundaryReached: null,
          };
        }),
      setTimeScale: (timeScale) => {
        if (!isTimeScale(timeScale)) {
          throw new RangeError("Unsupported simulation speed.");
        }
        set((state) => {
          const now = Date.now();
          return {
            ...boundedClockState(
              state,
              currentSimulationTimeMs(state, now),
              now,
            ),
            timeScale,
          };
        });
      },
      setSimulationTime: (simulationAtMs) => {
        if (!Number.isFinite(simulationAtMs)) {
          throw new RangeError("Simulation time must be finite.");
        }
        set((state) => boundedClockState(state, simulationAtMs, Date.now()));
      },
      stepSimulationDays: (days) => {
        if (!Number.isFinite(days)) {
          throw new RangeError("Simulation day step must be finite.");
        }
        set((state) =>
          boundedClockState(
            state,
            currentSimulationTimeMs(state) + days * MILLISECONDS_PER_DAY,
            Date.now(),
          ),
        );
      },
      resetSimulation: () =>
        set((state) => {
          const now = Date.now();
          return {
            isPaused: false,
            timeScale: 1,
            resetVersion: state.resetVersion + 1,
            simulationAtMs: now,
            clockAnchorRealMs: now,
            range: createSimulationRange(now),
            boundaryReached: null,
          };
        }),
    }),
    {
      name: "helios-simulation",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<SimulationState>;
        return {
          timeScale:
            typeof persisted.timeScale === "number" &&
            isTimeScale(persisted.timeScale)
              ? persisted.timeScale
              : 1,
        };
      },
      partialize: ({ timeScale }) => ({ timeScale }),
      skipHydration: true,
    },
  ),
);

export function resetSimulationStore(now = Date.now()): void {
  useSimulationStore.setState(stateAtNow(now));
}
