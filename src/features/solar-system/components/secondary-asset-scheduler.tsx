"use client";

import { useEffect } from "react";

import {
  markSecondaryStageStarted,
  useAssetLoadingSnapshot,
} from "@/features/solar-system/lib/asset-loading-lifecycle";
import { prioritizedSecondaryAssets } from "@/features/solar-system/lib/celestial-asset-scheduler";
import { currentNavigatorView } from "@/features/solar-system/lib/celestial-navigation-state";
import { activeSceneCategory } from "@/features/solar-system/lib/scene-visibility-policy";
import { acquireTexture } from "@/features/solar-system/lib/texture-cache";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";

export function SecondaryAssetScheduler() {
  const snapshot = useAssetLoadingSnapshot();
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const view = currentNavigatorView(navigator);
  const activeCategory = activeSceneCategory(view);
  const parentBodyId =
    view.kind === "moons"
      ? view.parentPlanetId
      : view.kind === "dwarf-system"
        ? view.parentBodyId
        : null;

  useEffect(() => {
    if (!snapshot.blockingReady) return;
    markSecondaryStageStarted();
    const assets = prioritizedSecondaryAssets({
      activeCategory,
      parentBodyId,
      promotedBodyId: hoveredBodyId ?? selectedBodyId,
    });
    const leases = assets.map((entry) => acquireTexture(entry.path));
    return () => leases.forEach((lease) => lease.release());
  }, [
    activeCategory,
    hoveredBodyId,
    parentBodyId,
    selectedBodyId,
    snapshot.blockingReady,
  ]);

  return null;
}
