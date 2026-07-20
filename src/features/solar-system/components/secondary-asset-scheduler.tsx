"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  markSecondaryStageStarted,
  useAssetLoadingSnapshot,
} from "@/features/solar-system/lib/asset-loading-lifecycle";
import {
  prioritizedSecondaryAssets,
  secondaryCelestialAssets,
} from "@/features/solar-system/lib/celestial-asset-scheduler";
import {
  activeNavigatorCategory,
  currentNavigatorView,
} from "@/features/solar-system/lib/celestial-navigation-state";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import { SecondaryTextureQueue } from "@/features/solar-system/lib/secondary-texture-queue";
import { acquireTexture } from "@/features/solar-system/lib/texture-cache";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";

async function requestSecondaryTexture(path: string): Promise<void> {
  const lease = acquireTexture(path);
  try {
    await lease.promise;
  } finally {
    lease.release();
  }
}

export function SecondaryAssetScheduler() {
  const snapshot = useAssetLoadingSnapshot();
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const categories = useSceneVisibilityStore((state) => state.categories);
  const objectOverrides = useSceneVisibilityStore(
    (state) => state.objectOverrides,
  );
  const queueRef = useRef<SecondaryTextureQueue | null>(null);
  if (queueRef.current == null) {
    queueRef.current = new SecondaryTextureQueue(requestSecondaryTexture);
  }

  const view = currentNavigatorView(navigator);
  const activeCategory = activeNavigatorCategory(view);
  const parentBodyId =
    view.kind === "moons"
      ? view.parentPlanetId
      : view.kind === "dwarf-system"
        ? view.parentBodyId
        : null;

  const orderedVisibleAssets = useMemo(
    () =>
      prioritizedSecondaryAssets({
        activeCategory,
        parentBodyId,
        promotedBodyId: selectedBodyId ?? hoveredBodyId,
        limit: secondaryCelestialAssets.length,
      }).filter((asset) =>
        effectiveBodyVisibility(asset.bodyId, {
          categories,
          objectOverrides,
        }),
      ),
    [
      activeCategory,
      categories,
      hoveredBodyId,
      objectOverrides,
      parentBodyId,
      selectedBodyId,
    ],
  );

  useEffect(() => {
    const queue = queueRef.current;
    return () => queue?.dispose();
  }, []);

  useEffect(() => {
    const queue = queueRef.current;
    if (!queue) return;
    if (!snapshot.blockingReady) {
      queue.update([]);
      return;
    }
    markSecondaryStageStarted();
    queue.update(orderedVisibleAssets.map((asset) => asset.path));
  }, [orderedVisibleAssets, snapshot.blockingReady]);

  return null;
}
