"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isPlanetId } from "@/content/planets";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetId } from "@/lib/data/schemas/planet";

export type CameraMode = "overview" | "transition" | "focus" | "free";

interface ExplorationState {
  selectedBodyId: CelestialBodyId | null;
  selectedPlanetId: PlanetId | null;
  hoveredBodyId: CelestialBodyId | null;
  hoveredPlanetId: PlanetId | null;
  cameraMode: CameraMode;
  cameraTransitionVersion: number;
  scaleMode: ScaleMode;
  selectSun: () => void;
  selectPlanet: (planetId: PlanetId) => void;
  selectBody: (bodyId: CelestialBodyId) => void;
  clearSelection: () => void;
  resetView: () => void;
  enterFreeCamera: () => void;
  guideCamera: () => void;
  exitFreeCamera: () => void;
  setHoveredPlanet: (planetId: PlanetId) => void;
  clearHoveredPlanet: (planetId: PlanetId) => void;
  setHoveredBody: (bodyId: CelestialBodyId) => void;
  clearHoveredBody: (bodyId: CelestialBodyId) => void;
  settleCamera: (
    expectedBodyId: CelestialBodyId | null,
    expectedVersion: number,
    mode: Extract<CameraMode, "overview" | "focus">,
  ) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
}

export const initialExplorationState = {
  selectedBodyId: null,
  selectedPlanetId: null,
  hoveredBodyId: null,
  hoveredPlanetId: null,
  cameraMode: "overview" as const,
  cameraTransitionVersion: 0,
  scaleMode: "exploration" as ScaleMode,
};

function transitionTo(
  state: ExplorationState,
  bodyId: CelestialBodyId | null,
): Partial<ExplorationState> {
  return {
    selectedBodyId: bodyId,
    selectedPlanetId: bodyId && isPlanetId(bodyId) ? bodyId : null,
    cameraMode: "transition",
    cameraTransitionVersion: state.cameraTransitionVersion + 1,
  };
}

export const useExplorationStore = create<ExplorationState>()(
  persist(
    (set) => ({
      ...initialExplorationState,
      selectSun: () => set((state) => transitionTo(state, "sun")),
      selectPlanet: (planetId) =>
        set((state) => transitionTo(state, planetId)),
      selectBody: (bodyId) => set((state) => transitionTo(state, bodyId)),
      clearSelection: () => set((state) => transitionTo(state, null)),
      resetView: () => set((state) => transitionTo(state, null)),
      enterFreeCamera: () =>
        set((state) =>
          state.cameraMode === "free"
            ? state
            : {
                cameraMode: "free",
                cameraTransitionVersion: state.cameraTransitionVersion + 1,
              },
        ),
      guideCamera: () =>
        set((state) => ({
          cameraMode: "transition",
          cameraTransitionVersion: state.cameraTransitionVersion + 1,
        })),
      exitFreeCamera: () =>
        set((state) =>
          state.cameraMode !== "free"
            ? state
            : {
                cameraMode: "transition",
                cameraTransitionVersion: state.cameraTransitionVersion + 1,
              },
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
      settleCamera: (expectedBodyId, expectedVersion, mode) =>
        set((state) => {
          if (
            state.cameraMode !== "transition" ||
            state.selectedBodyId !== expectedBodyId ||
            state.cameraTransitionVersion !== expectedVersion
          ) {
            return state;
          }
          return { cameraMode: mode };
        }),
      setScaleMode: (scaleMode) =>
        set((state) =>
          state.scaleMode === scaleMode
            ? state
            : {
                scaleMode,
                cameraMode: "transition",
                cameraTransitionVersion: state.cameraTransitionVersion + 1,
              },
        ),
    }),
    {
      name: "helios-exploration",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ scaleMode }) => ({ scaleMode }),
      migrate: (persisted) => {
        const state =
          persisted && typeof persisted === "object" ? persisted : {};
        const scaleMode = (state as { scaleMode?: unknown }).scaleMode;
        return {
          scaleMode: scaleMode === "scientific" ? "scientific" : "exploration",
        };
      },
      skipHydration: true,
    },
  ),
);

export function resetExplorationStore(): void {
  useExplorationStore.setState(initialExplorationState);
}
