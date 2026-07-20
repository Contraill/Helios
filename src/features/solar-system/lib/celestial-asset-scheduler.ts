import { DWARF_SATELLITE_BY_ID } from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import { MOON_BY_ID } from "@/features/solar-system/lib/moon-catalogue";
import {
  visualRegistryIds,
  visualProfileFor,
  type VisualBodyId,
} from "@/features/solar-system/lib/celestial-visual-registry";
import {
  isDwarfSatelliteIdValue,
  isMoonIdValue,
  type CelestialBodyId,
} from "@/features/solar-system/types/celestial-body";
import type { CelestialNavigatorCategory } from "@/features/solar-system/types/celestial-navigation";

export interface SecondaryCelestialAsset {
  readonly bodyId: VisualBodyId;
  readonly category: CelestialNavigatorCategory;
  readonly parentBodyId: CelestialBodyId | null;
  readonly path: string;
  readonly priority: number;
}

function navigatorCategory(bodyId: VisualBodyId): CelestialNavigatorCategory {
  const profile = visualProfileFor(bodyId);
  if (profile.category === "featured-moon") return "planetary-moons";
  if (profile.category === "asteroid") return "main-belt";
  if (profile.category === "comet") return "comets";
  return "dwarf-kuiper";
}

function parentBodyId(bodyId: VisualBodyId): CelestialBodyId | null {
  if (isMoonIdValue(bodyId)) return MOON_BY_ID[bodyId].parentPlanetId;
  if (isDwarfSatelliteIdValue(bodyId)) {
    return DWARF_SATELLITE_BY_ID[bodyId].parentId;
  }
  return null;
}

/** Secondary assets never join the blocking Sun/planet/Earth/Saturn opening gate. */
export const secondaryCelestialAssets: readonly SecondaryCelestialAsset[] =
  Object.freeze(
    visualRegistryIds.map((bodyId) => {
      const profile = visualProfileFor(bodyId);
      return Object.freeze({
        bodyId,
        category: navigatorCategory(bodyId),
        parentBodyId: parentBodyId(bodyId),
        path: profile.surface.assetPath,
        priority: profile.loadingPriority,
      });
    }),
  );

export interface SecondaryAssetPriorityContext {
  readonly activeCategory: CelestialNavigatorCategory | "overview";
  readonly parentBodyId: CelestialBodyId | null;
  readonly promotedBodyId: CelestialBodyId | null;
  readonly limit?: number;
}

/**
 * Produces a stable priority order. Selection wins, then the open parent
 * system, then the active Navigator category. Request concurrency is owned by
 * the secondary texture queue rather than by visibility or scene mounting.
 */
export function prioritizedSecondaryAssets({
  activeCategory,
  parentBodyId: promotedParent,
  promotedBodyId,
  limit = secondaryCelestialAssets.length,
}: SecondaryAssetPriorityContext): readonly SecondaryCelestialAsset[] {
  return [...secondaryCelestialAssets]
    .map((asset) => ({
      asset,
      score:
        (asset.bodyId === promotedBodyId ? 10_000 : 0) +
        (promotedBodyId !== null && asset.parentBodyId === promotedBodyId
          ? 4_000
          : 0) +
        (asset.bodyId === promotedParent ? 3_000 : 0) +
        (asset.parentBodyId === promotedParent ? 2_500 : 0) +
        (asset.category === activeCategory ? 1_000 : 0) +
        asset.priority +
        1,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, limit))
    .map(({ asset }) => asset);
}
