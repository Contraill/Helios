"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import type { PlanetId } from "@/lib/data/schemas/planet";
import { isPlanetId } from "@/content/planets";

export type CameraMode = "overview" | "transition" | "focus" | "free";

interface ExplorationState {
  selectedBodyId: CelestialBodyId | null;
  selectedPlanetId: PlanetId | null;
  hoveredBodyId: CelestialBodyId | null;
  hoveredPlanetId: PlanetId | null;
  cameraMode: CameraMode;
  scaleMode: ScaleMode;
  orbitsVisible: boolean;
  labelsVisible: boolean;
  selectSun: () => void;
  selectPlanet: (planetId: PlanetId) => void;
  selectBody: (bodyId: CelestialBodyId) => void;
  clearSelection: () => void;
  enterFreeCamera: () => void;
  exitFreeCamera: () => void;
  setHoveredPlanet: (planetId: PlanetId) => void;
  clearHoveredPlanet: (planetId: PlanetId) => void;
  setHoveredBody: (bodyId: CelestialBodyId) => void;
  clearHoveredBody: (bodyId: CelestialBodyId) => void;
  settleCamera: (
    expectedBodyId: CelestialBodyId | null,
    mode: Extract<CameraMode, "overview" | "focus">,
  ) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
}

export const initialExplorationState = {
  selectedBodyId: null,
  selectedPlanetId: null,
  hoveredBodyId: null,
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
      selectSun: () =>
        set((state) =>
          state.selectedBodyId === "sun" && state.cameraMode !== "free"
            ? state
            : {
                selectedBodyId: "sun",
                selectedPlanetId: null,
                cameraMode: "transition",
              },
        ),
      selectPlanet: (planetId) =>
        set((state) =>
          state.selectedBodyId === planetId && state.cameraMode !== "free"
            ? state
            : {
                selectedBodyId: planetId,
                selectedPlanetId: planetId,
                cameraMode: "transition",
              },
        ),
      selectBody: (bodyId) =>
        set((state) =>
          state.selectedBodyId === bodyId && state.cameraMode !== "free"
            ? state
            : {
                selectedBodyId: bodyId,
                selectedPlanetId: isPlanetId(bodyId) ? bodyId : null,
                cameraMode: "transition",
              },
        ),
      clearSelection: () =>
        set((state) =>
          state.selectedBodyId === null && state.cameraMode !== "free"
            ? state
            : {
                selectedBodyId: null,
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
          state.hoveredBodyId === planetId
            ? state
            : { hoveredBodyId: planetId, hoveredPlanetId: planetId },
        ),
      clearHoveredPlanet: (planetId) =>
        set((state) =>
          state.hoveredBodyId === planetId
            ? { hoveredBodyId: null, hoveredPlanetId: null }
            : state,
        ),
      setHoveredBody: (bodyId) =>
        set((state) =>
          state.hoveredBodyId === bodyId
            ? state
            : {
                hoveredBodyId: bodyId,
                hoveredPlanetId: isPlanetId(bodyId) ? bodyId : null,
              },
        ),
      clearHoveredBody: (bodyId) =>
        set((state) =>
          state.hoveredBodyId === bodyId
            ? { hoveredBodyId: null, hoveredPlanetId: null }
            : state,
        ),
      settleCamera: (expectedBodyId, mode) =>
        set((state) => {
          if (
            state.cameraMode !== "transition" ||
            state.selectedBodyId !== expectedBodyId
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
