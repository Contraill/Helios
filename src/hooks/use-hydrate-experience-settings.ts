"use client";

import { useEffect, useState } from "react";

import { migrateLegacyExplorePreferences } from "@/features/solar-system/lib/experience-storage-migration";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExtendedSystemStore } from "@/stores/extended-system-store";
import { useSimulationStore } from "@/stores/simulation-store";

export function useHydrateExperienceSettings(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    migrateLegacyExplorePreferences(localStorage);
    void Promise.allSettled([
      useExplorationStore.persist.rehydrate(),
      useSimulationStore.persist.rehydrate(),
      useExtendedSystemStore.persist.rehydrate(),
    ]).then(() => {
      if (active) setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return hydrated;
}
