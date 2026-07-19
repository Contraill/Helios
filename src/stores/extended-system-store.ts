"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BeltDensity = "sparse" | "standard" | "detailed";
export type BeltRepresentation = "physical" | "cinematic";
export type ExtendedLayerKey =
  | "asteroidBeltVisible"
  | "kuiperBeltVisible"
  | "cometsVisible"
  | "oortCloudVisible"
  | "dustVisible"
  | "heliosphereVisible";

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
  toggleLayer: (layer: ExtendedLayerKey) => void;
  showLayer: (layer: ExtendedLayerKey) => void;
  togglePanel: () => void;
  setDensity: (density: BeltDensity) => void;
  setRepresentation: (representation: BeltRepresentation) => void;
}

export const initialExtendedSystemState = {
  asteroidBeltVisible: true,
  kuiperBeltVisible: true,
  cometsVisible: false,
  oortCloudVisible: false,
  dustVisible: false,
  heliosphereVisible: false,
  panelExpanded: false,
  density: "standard" as BeltDensity,
  representation: "physical" as BeltRepresentation,
};

export const useExtendedSystemStore = create<ExtendedSystemState>()(
  persist(
    (set) => ({
      ...initialExtendedSystemState,
      // Progressive disclosure keeps the first frame legible. The two belts
      // establish the extended-system silhouette; animated/schematic context
      // is opt-in and remains available from the same control deck.
      toggleLayer: (layer) => set((state) => ({ [layer]: !state[layer] })),
      showLayer: (layer) => set({ [layer]: true }),
      togglePanel: () =>
        set((state) => ({ panelExpanded: !state.panelExpanded })),
      setDensity: (density) => set({ density }),
      setRepresentation: (representation) => set({ representation }),
    }),
    {
      name: "helios-extended-system",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const persisted = persistedState as Partial<ExtendedSystemState>;
        if (version >= 2) return persisted;
        return {
          ...persisted,
          cometsVisible: false,
          dustVisible: false,
          heliosphereVisible: false,
          oortCloudVisible: false,
        };
      },
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

export function resetExtendedSystemStore(): void {
  useExtendedSystemStore.setState(initialExtendedSystemState);
}
