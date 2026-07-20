"use client";

import { useEffect } from "react";

import { useAssetLoadingSnapshot } from "@/features/solar-system/lib/asset-loading-lifecycle";

import gateStyles from "./explore-scene-gate.module.css";

export function ExploreOpeningLoader() {
  const snapshot = useAssetLoadingSnapshot();

  useEffect(() => {
    document.documentElement.dataset.exploreSceneReady = snapshot.blockingReady
      ? "true"
      : "false";
    return () => {
      delete document.documentElement.dataset.exploreSceneReady;
    };
  }, [snapshot.blockingReady]);

  if (snapshot.blockingReady) return null;
  const sunReady =
    snapshot.statusByPath["/textures/planets/sun.webp"] === "ready";
  const label = !snapshot.rendererReady
    ? "Preparing the renderer"
    : !sunReady
      ? "Preparing the Sun"
      : snapshot.planetReadyCount < snapshot.planetTotal
        ? "Preparing the planets"
        : "Preparing final layers";

  return (
    <div
      aria-live="polite"
      aria-valuemax={snapshot.planetTotal}
      aria-valuemin={0}
      aria-valuenow={snapshot.planetReadyCount}
      className={gateStyles.openingLoader}
      data-testid="explore-opening-loader"
      role="progressbar"
    >
      <span className={gateStyles.openingLoaderOrb} aria-hidden="true" />
      <p>{label}</p>
      <strong>
        {snapshot.planetReadyCount} / {snapshot.planetTotal} planets ready
      </strong>
    </div>
  );
}
