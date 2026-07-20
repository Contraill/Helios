"use client";

import { useSyncExternalStore } from "react";

import { blockingPrimaryTextureAssets } from "@/content/sources/planet-textures";

export type AssetLoadStatus = "idle" | "loading" | "ready" | "error";

export interface AssetLoadingSnapshot {
  readonly blockingReady: boolean;
  readonly degradedOwners: readonly string[];
  readonly firstCompleteFrame: boolean;
  readonly planetReadyCount: number;
  readonly planetTotal: number;
  readonly primarySettled: number;
  readonly primaryTotal: number;
  readonly rendererReady: boolean;
  readonly secondaryStageStarted: boolean;
  readonly statusByPath: Readonly<Record<string, AssetLoadStatus>>;
}

const primaryAssets = blockingPrimaryTextureAssets;
const surfacePlanetAssets = primaryAssets.filter(
  (entry) =>
    entry.kind === "primary-surface" && entry.owner !== "celestial:sun:surface",
);
const statusByPath = new Map<string, AssetLoadStatus>(
  primaryAssets.map((entry) => [entry.path, "idle"]),
);
const appliedOwners = new Set<string>();
const degradedOwners = new Set<string>();
const listeners = new Set<() => void>();
let rendererReady = false;
let rendererUnavailable = false;
let secondaryStageStarted = false;
let materialRevision = 0;
let renderedRevision = -1;
let cachedSnapshot: AssetLoadingSnapshot;

function createSnapshot(): AssetLoadingSnapshot {
  const statuses = Object.fromEntries(statusByPath) as Record<
    string,
    AssetLoadStatus
  >;
  const settled = primaryAssets.filter((entry) => {
    const status = statuses[entry.path];
    return status === "ready" || status === "error";
  });
  const allMaterialsResolved = primaryAssets.every((entry) =>
    appliedOwners.has(entry.owner),
  );
  const firstCompleteFrame =
    renderedRevision >= materialRevision && allMaterialsResolved;
  const blockingReady =
    rendererUnavailable ||
    (rendererReady &&
      settled.length === primaryAssets.length &&
      allMaterialsResolved &&
      firstCompleteFrame);
  return Object.freeze({
    blockingReady,
    degradedOwners: Object.freeze([...degradedOwners].sort()),
    firstCompleteFrame,
    planetReadyCount: surfacePlanetAssets.filter(
      (entry) => statuses[entry.path] === "ready",
    ).length,
    planetTotal: surfacePlanetAssets.length,
    primarySettled: settled.length,
    primaryTotal: primaryAssets.length,
    rendererReady,
    secondaryStageStarted,
    statusByPath: Object.freeze(statuses),
  });
}

function emit(): void {
  cachedSnapshot = createSnapshot();
  for (const listener of listeners) listener();
}

cachedSnapshot = createSnapshot();

export function assetLoadingSnapshot(): AssetLoadingSnapshot {
  return cachedSnapshot;
}

export function subscribeAssetLoading(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAssetLoadingSnapshot(): AssetLoadingSnapshot {
  return useSyncExternalStore(
    subscribeAssetLoading,
    assetLoadingSnapshot,
    assetLoadingSnapshot,
  );
}

export function markRendererReady(): void {
  if (rendererReady) return;
  rendererReady = true;
  emit();
}

export function markRendererUnavailable(): void {
  rendererUnavailable = true;
  emit();
}

export function markPrimaryAssetStatus(
  path: string,
  status: AssetLoadStatus,
): void {
  if (!statusByPath.has(path) || statusByPath.get(path) === status) return;
  statusByPath.set(path, status);
  emit();
}

export function markMaterialApplied(owner: string, degraded = false): void {
  const firstApplication = !appliedOwners.has(owner);
  appliedOwners.add(owner);
  if (degraded) degradedOwners.add(owner);
  else degradedOwners.delete(owner);
  if (firstApplication) materialRevision += 1;
  emit();
}

export function markCompleteFrameRendered(): void {
  if (renderedRevision === materialRevision) return;
  renderedRevision = materialRevision;
  emit();
}

export function markSecondaryStageStarted(): void {
  if (secondaryStageStarted) return;
  secondaryStageStarted = true;
  emit();
}

export function resetAssetLoadingLifecycle(): void {
  for (const entry of primaryAssets) statusByPath.set(entry.path, "idle");
  appliedOwners.clear();
  degradedOwners.clear();
  rendererReady = false;
  rendererUnavailable = false;
  secondaryStageStarted = false;
  materialRevision = 0;
  renderedRevision = -1;
  emit();
}
