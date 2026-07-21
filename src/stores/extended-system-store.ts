"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ExtendedSystemState {
  dustVisible: boolean;
  toggleDust: () => void;
}

export const initialExtendedSystemState = {
  dustVisible: false,
};

function dustPreferenceFrom(persistedState: unknown): boolean {
  if (typeof persistedState !== "object" || persistedState === null) {
    return initialExtendedSystemState.dustVisible;
  }
  const dustVisible = (persistedState as { dustVisible?: unknown }).dustVisible;
  return typeof dustVisible === "boolean"
    ? dustVisible
    : initialExtendedSystemState.dustVisible;
}

export const useExtendedSystemStore = create<ExtendedSystemState>()(
  persist(
    (set) => ({
      ...initialExtendedSystemState,
      toggleDust: () => set((state) => ({ dustVisible: !state.dustVisible })),
    }),
    {
      name: "helios-extended-system",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => ({
        dustVisible: dustPreferenceFrom(persistedState),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        dustVisible: dustPreferenceFrom(persistedState),
      }),
      partialize: ({ dustVisible }) => ({ dustVisible }),
      skipHydration: true,
    },
  ),
);

export function resetExtendedSystemStore(): void {
  useExtendedSystemStore.setState(initialExtendedSystemState);
}
