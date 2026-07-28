import { planetIds, isPlanetId } from "@/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  isDwarfSatelliteIdValue,
  isExtendedBodyIdValue,
  isMoonIdValue,
  isSystemRegionIdValue,
  SYSTEM_REGION_IDS,
  type CelestialBodyId,
  type DwarfSatelliteId,
  type ExtendedBodyId,
  type MoonId,
  type SystemRegionId,
} from "@/features/solar-system/types/celestial-body";
import type { PlanetId } from "@/lib/data/schemas/planet";

export type RealBodySlug =
  "sun" | PlanetId | MoonId | ExtendedBodyId | DwarfSatelliteId;

export type CelestialDetailSlug = RealBodySlug | SystemRegionId;

export const REAL_BODY_SLUGS: readonly RealBodySlug[] = Object.freeze([
  "sun",
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...EXTENDED_BODY_IDS,
  ...DWARF_SATELLITE_IDS,
]);

export const CELESTIAL_DETAIL_SLUGS: readonly CelestialDetailSlug[] =
  Object.freeze([...REAL_BODY_SLUGS, ...SYSTEM_REGION_IDS]);

export function isRealBodySlug(value: string): value is RealBodySlug {
  return (
    value === "sun" ||
    isPlanetId(value) ||
    isMoonIdValue(value) ||
    isExtendedBodyIdValue(value) ||
    isDwarfSatelliteIdValue(value)
  );
}

export function isCelestialDetailSlug(
  value: string,
): value is CelestialDetailSlug {
  return isRealBodySlug(value) || isSystemRegionIdValue(value);
}

export function bodyDetailHref(id: CelestialBodyId): string | null {
  return isRealBodySlug(id) ? `/body/${id}` : null;
}

export function celestialDetailHref(id: CelestialBodyId): string {
  return isSystemRegionIdValue(id) ? `/region/${id}` : `/body/${id}`;
}
