"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

import {
  blockingPrimaryTextureAssets,
  earthCityLightsTextureSource,
  earthCloudTextureSource,
  planetTextureSources,
  saturnRingTextureSource,
  type RuntimeTextureAsset,
} from "@/content/sources/planet-textures";
import {
  assetLoadingSnapshot,
  markMaterialApplied,
  markPrimaryAssetStatus,
  markRendererUnavailable,
  subscribeAssetLoading,
} from "@/features/solar-system/lib/asset-loading-lifecycle";
import { acquireTexture } from "@/features/solar-system/lib/texture-cache";

const PRIMARY_TIMEOUT_MS = 15_000;
const RENDERER_TIMEOUT_MS = 15_000;

const primaryStages: readonly (readonly RuntimeTextureAsset[])[] =
  Object.freeze([
    Object.freeze([planetTextureSources.sun.asset]),
    Object.freeze([
      planetTextureSources.mercury.asset,
      planetTextureSources.venus.asset,
      planetTextureSources.earth.asset,
      planetTextureSources.mars.asset,
      planetTextureSources.jupiter.asset,
      planetTextureSources.saturn.asset,
      planetTextureSources.uranus.asset,
      planetTextureSources.neptune.asset,
    ]),
    Object.freeze([
      earthCloudTextureSource.asset,
      earthCityLightsTextureSource.asset,
      saturnRingTextureSource,
    ]),
  ]);

if (primaryStages.flat().length !== blockingPrimaryTextureAssets.length) {
  throw new Error(
    "Primary texture stages must own every blocking asset exactly once.",
  );
}

interface ActiveLease {
  readonly release: () => void;
  readonly timeout: number;
}

function waitForRenderer(active: () => boolean): Promise<void> {
  const current = assetLoadingSnapshot();
  if (current.rendererReady || !active()) return Promise.resolve();

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      unsubscribe();
      resolve();
    };
    const unsubscribe = subscribeAssetLoading(() => {
      if (!active() || assetLoadingSnapshot().rendererReady) finish();
    });
    const timeout = window.setTimeout(() => {
      if (active()) markRendererUnavailable();
      finish();
    }, RENDERER_TIMEOUT_MS);
  });
}

export function TexturePreloader() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let active = true;
    const leases: ActiveLease[] = [];

    const settleAsset = (entry: RuntimeTextureAsset): Promise<void> => {
      markPrimaryAssetStatus(entry.path, "loading");
      const lease = acquireTexture(entry.path);

      return new Promise((resolve) => {
        let stageSettled = false;
        const finishStage = () => {
          if (stageSettled) return;
          stageSettled = true;
          resolve();
        };
        const fail = () => {
          if (!active) return;
          markPrimaryAssetStatus(entry.path, "error");
          markMaterialApplied(entry.owner, true);
          invalidate();
          finishStage();
        };
        const timeout = window.setTimeout(fail, PRIMARY_TIMEOUT_MS);
        leases.push({ release: lease.release, timeout });

        void lease.promise.then(
          () => {
            window.clearTimeout(timeout);
            if (!active) return;
            markPrimaryAssetStatus(entry.path, "ready");
            invalidate();
            finishStage();
          },
          () => {
            window.clearTimeout(timeout);
            fail();
          },
        );
      });
    };

    void (async () => {
      await waitForRenderer(() => active);
      if (!active || !assetLoadingSnapshot().rendererReady) return;

      for (const stage of primaryStages) {
        await Promise.all(stage.map(settleAsset));
        if (!active) return;
      }
    })();

    return () => {
      active = false;
      for (const entry of leases) {
        window.clearTimeout(entry.timeout);
        entry.release();
      }
    };
  }, [invalidate]);

  return null;
}
