"use client";

import { useEffect } from "react";

import { useAssetLoadingSnapshot } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { isVisualCatalogueEvidenceRequest } from "@/features/solar-system/lib/scene-test-readiness";
import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { useLocaleStore } from "@/stores/locale-store";

import controlStyles from "./explore-scene-controls.module.css";

export function ExploreOpeningLoader() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExplorePageCopy(locale).loader;
  const snapshot = useAssetLoadingSnapshot();
  const catalogueEvidenceReady = isVisualCatalogueEvidenceRequest(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const ready = snapshot.blockingReady || catalogueEvidenceReady;

  useEffect(() => {
    document.documentElement.dataset.exploreSceneReady = ready
      ? "true"
      : "false";
    return () => {
      delete document.documentElement.dataset.exploreSceneReady;
    };
  }, [ready]);

  if (ready) return null;
  const sunReady =
    snapshot.statusByPath["/textures/planets/sun.webp"] === "ready";
  const label = !snapshot.rendererReady
    ? copy.renderer
    : !sunReady
      ? copy.sun
      : snapshot.planetReadyCount < snapshot.planetTotal
        ? copy.planets
        : copy.finalLayers;

  return (
    <div
      aria-label={copy.ariaLabel}
      aria-live="polite"
      aria-valuemax={snapshot.planetTotal}
      aria-valuemin={0}
      aria-valuenow={snapshot.planetReadyCount}
      aria-valuetext={`${label}. ${copy.progress(snapshot.planetReadyCount, snapshot.planetTotal)}.`}
      className={controlStyles.openingLoader}
      data-testid="explore-opening-loader"
      role="progressbar"
    >
      <span className={controlStyles.openingLoaderOrb} aria-hidden="true" />
      <p>{label}</p>
      <strong>
        {copy.progress(snapshot.planetReadyCount, snapshot.planetTotal)}
      </strong>
    </div>
  );
}
