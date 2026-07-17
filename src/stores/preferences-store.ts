"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  MotionPreference,
  QualityLevel,
} from "@/features/solar-system/types/experience-settings";

interface PreferencesState {
  controlDeckExpanded: boolean;
  qualityLevel: QualityLevel;
  motionPreference: MotionPreference;
  setControlDeckExpanded: (expanded: boolean) => void;
  setQualityLevel: (qualityLevel: QualityLevel) => void;
  setMotionPreference: (motionPreference: MotionPreference) => void;
  toggleControlDeck: () => void;
}

export const initialPreferencesState = {
  controlDeckExpanded: true,
  qualityLevel: "medium" as QualityLevel,
  motionPreference: "system" as MotionPreference,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialPreferencesState,
      setControlDeckExpanded: (controlDeckExpanded) =>
        set({ controlDeckExpanded }),
      setQualityLevel: (qualityLevel) => set({ qualityLevel }),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
      toggleControlDeck: () =>
        set((state) => ({ controlDeckExpanded: !state.controlDeckExpanded })),
    }),
    {
      name: "helios-preferences",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        controlDeckExpanded,
        motionPreference,
        qualityLevel,
      }) => ({
        controlDeckExpanded,
        motionPreference,
        qualityLevel,
      }),
      skipHydration: true,
    },
  ),
);

export function resetPreferencesStore(): void {
  usePreferencesStore.setState(initialPreferencesState);
}
