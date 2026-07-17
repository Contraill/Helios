"use client";

import { create } from "zustand";

import type { PlanetId } from "@/lib/data/schemas/planet";

export type CameraMode = "overview" | "transition" | "focus";

interface ExplorationState {
  selectedPlanetId: PlanetId | null;
  hoveredPlanetId: PlanetId | null;
  cameraMode: CameraMode;
  selectPlanet: (planetId: PlanetId) => void;
  clearSelection: () => void;
  setHoveredPlanet: (planetId: PlanetId) => void;
  clearHoveredPlanet: (planetId: PlanetId) => void;
  settleCamera: (
    expectedPlanetId: PlanetId | null,
    mode: Extract<CameraMode, "overview" | "focus">,
  ) => void;
}

export const initialExplorationState = {
  selectedPlanetId: null,
  hoveredPlanetId: null,
  cameraMode: "overview" as const,
};

export const useExplorationStore = create<ExplorationState>((set) => ({
  ...initialExplorationState,
  selectPlanet: (planetId) =>
    set((state) =>
      state.selectedPlanetId === planetId
        ? state
        : {
            selectedPlanetId: planetId,
            cameraMode: "transition",
          },
    ),
  clearSelection: () =>
    set((state) =>
      state.selectedPlanetId === null
        ? state
        : {
            selectedPlanetId: null,
            cameraMode: "transition",
          },
    ),
  setHoveredPlanet: (planetId) =>
    set((state) =>
      state.hoveredPlanetId === planetId
        ? state
        : { hoveredPlanetId: planetId },
    ),
  clearHoveredPlanet: (planetId) =>
    set((state) =>
      state.hoveredPlanetId === planetId ? { hoveredPlanetId: null } : state,
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
}));

export function resetExplorationStore(): void {
  useExplorationStore.setState(initialExplorationState);
}
