import {
  DWARF_SATELLITE_BY_ID,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
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
 * Keeps a bounded residency window. Selection wins, then open parent system,
 * then active category. Assets outside the window release their cache leases.
 */
export function prioritizedSecondaryAssets({
  activeCategory,
  parentBodyId: promotedParent,
  promotedBodyId,
  limit = 12,
}: SecondaryAssetPriorityContext): readonly SecondaryCelestialAsset[] {
  return [...secondaryCelestialAssets]
    .map((asset) => ({
      asset,
      score:
        (asset.bodyId === promotedBodyId ? 10_000 : 0) +
        (asset.parentBodyId === promotedBodyId ? 4_000 : 0) +
        (asset.bodyId === promotedParent ? 3_000 : 0) +
        (asset.parentBodyId === promotedParent ? 2_500 : 0) +
        (asset.category === activeCategory ? 1_000 : 0) +
        asset.priority,
    }))
    .filter(({ score }) => score >= 1_000 || promotedBodyId !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, limit))
    .map(({ asset }) => asset);
}
