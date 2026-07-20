"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type BeltDensity = "sparse" | "standard" | "detailed";
export type BeltRepresentation = "physical" | "cinematic";

interface ExtendedSystemState {
  density: BeltDensity;
  representation: BeltRepresentation;
  dustVisible: boolean;
  setDensity: (density: BeltDensity) => void;
  setRepresentation: (representation: BeltRepresentation) => void;
  toggleDust: () => void;
}

export const initialExtendedSystemState = {
  density: "standard" as BeltDensity,
  representation: "physical" as BeltRepresentation,
  dustVisible: false,
};

function isBeltDensity(value: unknown): value is BeltDensity {
  return value === "sparse" || value === "standard" || value === "detailed";
}

function isBeltRepresentation(value: unknown): value is BeltRepresentation {
  return value === "physical" || value === "cinematic";
}

export const useExtendedSystemStore = create<ExtendedSystemState>()(
  persist(
    (set) => ({
      ...initialExtendedSystemState,
      setDensity: (density) => set({ density }),
      setRepresentation: (representation) => set({ representation }),
      toggleDust: () => set((state) => ({ dustVisible: !state.dustVisible })),
    }),
    {
      name: "helios-extended-system",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<ExtendedSystemState>;
        return {
          density: isBeltDensity(persisted.density)
            ? persisted.density
            : initialExtendedSystemState.density,
          representation: isBeltRepresentation(persisted.representation)
            ? persisted.representation
            : initialExtendedSystemState.representation,
          dustVisible:
            typeof persisted.dustVisible === "boolean"
              ? persisted.dustVisible
              : initialExtendedSystemState.dustVisible,
        };
      },
      partialize: ({ density, dustVisible, representation }) => ({
        density,
        dustVisible,
        representation,
      }),
      skipHydration: true,
    },
  ),
);

export function resetExtendedSystemStore(): void {
  useExtendedSystemStore.setState(initialExtendedSystemState);
}
