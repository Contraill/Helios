"use client";

import { useEffect, useState } from "react";

import { migrateLegacyExplorePreferences } from "@/features/solar-system/lib/experience-storage-migration";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";

export function useHydrateExperienceSettings(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    migrateLegacyExplorePreferences(localStorage);
    void Promise.allSettled([
      useExplorationStore.persist.rehydrate(),
      useSimulationStore.persist.rehydrate(),
      useSceneVisibilityStore.persist.rehydrate(),
    ]).then(() => {
      if (active) setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return hydrated;
}
