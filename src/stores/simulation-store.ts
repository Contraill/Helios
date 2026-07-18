"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  isTimeScale,
  type TimeScale,
} from "@/features/solar-system/types/experience-settings";
import { HORIZONS_SNAPSHOT_OBSERVED_AT } from "@/lib/data/ephemeris/horizons-snapshot";

const SIMULATION_MILLISECONDS_PER_REAL_MILLISECOND = 21_600;
const MILLISECONDS_PER_DAY = 86_400_000;

export interface SimulationState {
  isPaused: boolean;
  timeScale: TimeScale;
  resetVersion: number;
  simulationAtMs: number;
  clockAnchorRealMs: number;
  togglePaused: () => void;
  setTimeScale: (timeScale: TimeScale) => void;
  setSimulationTime: (simulationAtMs: number) => void;
  stepSimulationDays: (days: number) => void;
  resetSimulation: () => void;
}

export const initialSimulationState = {
  isPaused: false,
  timeScale: 1 as TimeScale,
  resetVersion: 0,
  simulationAtMs: Date.parse(HORIZONS_SNAPSHOT_OBSERVED_AT),
  clockAnchorRealMs: 0,
};

export function currentSimulationTimeMs(
  state: Pick<
    SimulationState,
    "clockAnchorRealMs" | "isPaused" | "simulationAtMs" | "timeScale"
  >,
  realNowMs = Date.now(),
): number {
  if (state.isPaused || state.clockAnchorRealMs === 0) {
    return state.simulationAtMs;
  }
  const elapsedRealMs = Math.max(0, realNowMs - state.clockAnchorRealMs);
  return (
    state.simulationAtMs +
    elapsedRealMs *
      state.timeScale *
      SIMULATION_MILLISECONDS_PER_REAL_MILLISECOND
  );
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      ...initialSimulationState,
      togglePaused: () =>
        set((state) => {
          const now = Date.now();
          return {
            isPaused: !state.isPaused,
            simulationAtMs: currentSimulationTimeMs(state, now),
            clockAnchorRealMs: now,
          };
        }),
      setTimeScale: (timeScale) => {
        if (!isTimeScale(timeScale)) {
          throw new RangeError("Unsupported simulation speed.");
        }
        set((state) => {
          const now = Date.now();
          return {
            timeScale,
            simulationAtMs: currentSimulationTimeMs(state, now),
            clockAnchorRealMs: now,
          };
        });
      },
      setSimulationTime: (simulationAtMs) => {
        if (!Number.isFinite(simulationAtMs)) {
          throw new RangeError("Simulation time must be finite.");
        }
        set({ simulationAtMs, clockAnchorRealMs: Date.now() });
      },
      stepSimulationDays: (days) => {
        if (!Number.isFinite(days)) {
          throw new RangeError("Simulation day step must be finite.");
        }
        set((state) => ({
          simulationAtMs:
            currentSimulationTimeMs(state) + days * MILLISECONDS_PER_DAY,
          clockAnchorRealMs: Date.now(),
        }));
      },
      resetSimulation: () =>
        set((state) => ({
          isPaused: false,
          timeScale: 1,
          resetVersion: state.resetVersion + 1,
          simulationAtMs: Date.now(),
          clockAnchorRealMs: Date.now(),
        })),
    }),
    {
      name: "helios-simulation",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ timeScale }) => ({ timeScale }),
      skipHydration: true,
    },
  ),
);

export function resetSimulationStore(): void {
  useSimulationStore.setState(initialSimulationState);
}
