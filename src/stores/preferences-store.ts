"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  MotionPreference,
  QualityLevel,
} from "@/features/solar-system/types/experience-settings";

interface PreferencesState {
  qualityLevel: QualityLevel;
  motionPreference: MotionPreference;
  setQualityLevel: (qualityLevel: QualityLevel) => void;
  setMotionPreference: (motionPreference: MotionPreference) => void;
}

export const initialPreferencesState = {
  qualityLevel: "medium" as QualityLevel,
  motionPreference: "system" as MotionPreference,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialPreferencesState,
      setQualityLevel: (qualityLevel) => set({ qualityLevel }),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
    }),
    {
      name: "helios-preferences",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ motionPreference, qualityLevel }) => ({
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
