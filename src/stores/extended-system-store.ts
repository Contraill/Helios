"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BeltDensity = "sparse" | "standard" | "detailed";
export type BeltRepresentation = "physical" | "cinematic";

interface ExtendedSystemState {
  asteroidBeltVisible: boolean;
  kuiperBeltVisible: boolean;
  cometsVisible: boolean;
  oortCloudVisible: boolean;
  dustVisible: boolean;
  heliosphereVisible: boolean;
  panelExpanded: boolean;
  density: BeltDensity;
  representation: BeltRepresentation;
  toggleLayer: (
    layer:
      | "asteroidBeltVisible"
      | "kuiperBeltVisible"
      | "cometsVisible"
      | "oortCloudVisible"
      | "dustVisible"
      | "heliosphereVisible",
  ) => void;
  togglePanel: () => void;
  setDensity: (density: BeltDensity) => void;
  setRepresentation: (representation: BeltRepresentation) => void;
}

export const useExtendedSystemStore = create<ExtendedSystemState>()(
  persist(
    (set) => ({
      asteroidBeltVisible: true,
      kuiperBeltVisible: true,
      cometsVisible: true,
      oortCloudVisible: true,
      dustVisible: true,
      heliosphereVisible: true,
      panelExpanded: false,
      density: "standard",
      representation: "physical",
      toggleLayer: (layer) => set((state) => ({ [layer]: !state[layer] })),
      togglePanel: () =>
        set((state) => ({ panelExpanded: !state.panelExpanded })),
      setDensity: (density) => set({ density }),
      setRepresentation: (representation) => set({ representation }),
    }),
    {
      name: "helios-extended-system",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        asteroidBeltVisible,
        cometsVisible,
        density,
        dustVisible,
        heliosphereVisible,
        kuiperBeltVisible,
        oortCloudVisible,
        representation,
      }) => ({
        asteroidBeltVisible,
        cometsVisible,
        density,
        dustVisible,
        heliosphereVisible,
        kuiperBeltVisible,
        oortCloudVisible,
        representation,
      }),
      skipHydration: true,
    },
  ),
);
