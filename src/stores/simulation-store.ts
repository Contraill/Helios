"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  isTimeScale,
  type TimeScale,
} from "@/features/solar-system/types/experience-settings";

interface SimulationState {
  isPaused: boolean;
  timeScale: TimeScale;
  resetVersion: number;
  togglePaused: () => void;
  setTimeScale: (timeScale: TimeScale) => void;
  resetSimulation: () => void;
}

export const initialSimulationState = {
  isPaused: false,
  timeScale: 1 as TimeScale,
  resetVersion: 0,
};

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      ...initialSimulationState,
      togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
      setTimeScale: (timeScale) => {
        if (!isTimeScale(timeScale)) {
          throw new RangeError("Unsupported simulation speed.");
        }
        set({ timeScale });
      },
      resetSimulation: () =>
        set((state) => ({
          isPaused: false,
          timeScale: 1,
          resetVersion: state.resetVersion + 1,
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
