"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetId } from "@/lib/data/schemas/planet";

export type CameraMode = "overview" | "transition" | "focus" | "free";

interface ExplorationState {
  selectedPlanetId: PlanetId | null;
  hoveredPlanetId: PlanetId | null;
  cameraMode: CameraMode;
  scaleMode: ScaleMode;
  orbitsVisible: boolean;
  labelsVisible: boolean;
  selectPlanet: (planetId: PlanetId) => void;
  clearSelection: () => void;
  enterFreeCamera: () => void;
  exitFreeCamera: () => void;
  setHoveredPlanet: (planetId: PlanetId) => void;
  clearHoveredPlanet: (planetId: PlanetId) => void;
  settleCamera: (
    expectedPlanetId: PlanetId | null,
    mode: Extract<CameraMode, "overview" | "focus">,
  ) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
}

export const initialExplorationState = {
  selectedPlanetId: null,
  hoveredPlanetId: null,
  cameraMode: "overview" as const,
  scaleMode: "exploration" as ScaleMode,
  orbitsVisible: true,
  labelsVisible: true,
};

export const useExplorationStore = create<ExplorationState>()(
  persist(
    (set) => ({
      ...initialExplorationState,
      selectPlanet: (planetId) =>
        set((state) =>
          state.selectedPlanetId === planetId && state.cameraMode !== "free"
            ? state
            : {
                selectedPlanetId: planetId,
                cameraMode: "transition",
              },
        ),
      clearSelection: () =>
        set((state) =>
          state.selectedPlanetId === null && state.cameraMode !== "free"
            ? state
            : {
                selectedPlanetId: null,
                cameraMode: "transition",
              },
        ),
      enterFreeCamera: () =>
        set((state) =>
          state.cameraMode === "free" ? state : { cameraMode: "free" },
        ),
      exitFreeCamera: () =>
        set((state) =>
          state.cameraMode !== "free" ? state : { cameraMode: "transition" },
        ),
      setHoveredPlanet: (planetId) =>
        set((state) =>
          state.hoveredPlanetId === planetId
            ? state
            : { hoveredPlanetId: planetId },
        ),
      clearHoveredPlanet: (planetId) =>
        set((state) =>
          state.hoveredPlanetId === planetId
            ? { hoveredPlanetId: null }
            : state,
        ),
      settleCamera: (expectedPlanetId, mode) =>
        set((state) => {
          if (
            state.cameraMode !== "transition" ||
            state.selectedPlanetId !== expectedPlanetId
          ) {
            return state;
          }
          return { cameraMode: mode };
        }),
      setScaleMode: (scaleMode) =>
        set((state) =>
          state.scaleMode === scaleMode
            ? state
            : { scaleMode, cameraMode: "transition" },
        ),
      toggleOrbits: () =>
        set((state) => ({ orbitsVisible: !state.orbitsVisible })),
      toggleLabels: () =>
        set((state) => ({ labelsVisible: !state.labelsVisible })),
    }),
    {
      name: "helios-exploration",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ labelsVisible, orbitsVisible, scaleMode }) => ({
        labelsVisible,
        orbitsVisible,
        scaleMode,
      }),
      skipHydration: true,
    },
  ),
);

export function resetExplorationStore(): void {
  useExplorationStore.setState(initialExplorationState);
}
