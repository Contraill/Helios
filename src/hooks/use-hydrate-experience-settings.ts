"use client";

import { useEffect } from "react";

import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSimulationStore } from "@/stores/simulation-store";

export function useHydrateExperienceSettings(): void {
  useEffect(() => {
    void Promise.all([
      useExplorationStore.persist.rehydrate(),
      usePreferencesStore.persist.rehydrate(),
      useSimulationStore.persist.rehydrate(),
    ]);
  }, []);
}
