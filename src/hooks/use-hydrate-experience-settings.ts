"use client";

import { useEffect, useState } from "react";

import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSimulationStore } from "@/stores/simulation-store";

export function useHydrateExperienceSettings(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      useExplorationStore.persist.rehydrate(),
      usePreferencesStore.persist.rehydrate(),
      useSimulationStore.persist.rehydrate(),
    ]).then(() => {
      if (active) setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return hydrated;
}
