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

function scheduleBackgroundQueueUpdate(
  queue: SecondaryTextureQueue,
  paths: readonly string[],
): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const requestId = window.requestIdleCallback(() => queue.update(paths), {
      timeout: 1_000,
    });
    return () => window.cancelIdleCallback(requestId);
  }

  const timeoutId = window.setTimeout(() => queue.update(paths), 50);
  return () => window.clearTimeout(timeoutId);
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
    const paths = orderedVisibleAssets.map((asset) => asset.path);

    // Selection and hover are interactive priority signals and should be
    // applied immediately. The initial/background wave waits for an idle
    // period so primary readiness and the first user action are not competing
    // with four image decodes on the main thread.
    if (selectedBodyId !== null || hoveredBodyId !== null) {
      queue.update(paths);
      return;
    }

    return scheduleBackgroundQueueUpdate(queue, paths);
  }, [
    hoveredBodyId,
    orderedVisibleAssets,
    selectedBodyId,
    snapshot.blockingReady,
  ]);

  return null;
}
