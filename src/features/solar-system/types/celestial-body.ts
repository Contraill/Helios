import type { PlanetId } from "@/lib/data/schemas/planet";

export const FEATURED_MOON_PARENT_IDS = [
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
] as const satisfies readonly PlanetId[];

export type MoonParentPlanetId = (typeof FEATURED_MOON_PARENT_IDS)[number];

export const FEATURED_MOON_IDS = [
  "moon-earth-moon",
  "moon-mars-phobos",
  "moon-mars-deimos",
  "moon-jupiter-io",
  "moon-jupiter-europa",
  "moon-jupiter-ganymede",
  "moon-jupiter-callisto",
  "moon-saturn-mimas",
  "moon-saturn-enceladus",
  "moon-saturn-tethys",
  "moon-saturn-dione",
  "moon-saturn-rhea",
  "moon-saturn-titan",
  "moon-saturn-iapetus",
  "moon-uranus-miranda",
  "moon-uranus-ariel",
  "moon-uranus-umbriel",
  "moon-uranus-titania",
  "moon-uranus-oberon",
  "moon-neptune-proteus",
  "moon-neptune-triton",
  "moon-neptune-nereid",
] as const;

export type MoonId = (typeof FEATURED_MOON_IDS)[number];

export const EXTENDED_BODY_IDS = [
  "ceres",
  "vesta",
  "pallas",
  "hygiea",
  "pluto",
  "eris",
  "haumea",
  "makemake",
  "quaoar",
  "gonggong",
  "sedna",
  "orcus",
  "halley",
  "hale-bopp",
  "encke",
  "67p",
  "neowise",
  "tempel-1",
] as const;

export type ExtendedBodyId = (typeof EXTENDED_BODY_IDS)[number];

export const DWARF_SATELLITE_IDS = [
  "dwarf-satellite-charon",
  "dwarf-satellite-dysnomia",
  "dwarf-satellite-hiiaka",
  "dwarf-satellite-namaka",
  "dwarf-satellite-mk2",
  "dwarf-satellite-weywot",
  "dwarf-satellite-xiangliu",
  "dwarf-satellite-vanth",
] as const;

export type DwarfSatelliteId = (typeof DWARF_SATELLITE_IDS)[number];

export const DWARF_SYSTEM_PARENT_IDS = [
  "pluto",
  "eris",
  "haumea",
  "makemake",
  "quaoar",
  "gonggong",
  "orcus",
] as const satisfies readonly ExtendedBodyId[];

export type DwarfSystemParentId = (typeof DWARF_SYSTEM_PARENT_IDS)[number];

export const SYSTEM_REGION_IDS = [
  "asteroid-belt",
  "kuiper-belt",
  "oort-cloud",
  "heliosphere",
] as const;

export type SystemRegionId = (typeof SYSTEM_REGION_IDS)[number];

/** A body or region that can own hover, selection and guided-camera focus. */
export type CelestialBodyId =
  | "sun"
  | PlanetId
  | MoonId
  | ExtendedBodyId
  | DwarfSatelliteId
  | SystemRegionId;

export function isMoonIdValue(value: string): value is MoonId {
  return (FEATURED_MOON_IDS as readonly string[]).includes(value);
}

export function isMoonParentPlanetId(
  value: string,
): value is MoonParentPlanetId {
  return (FEATURED_MOON_PARENT_IDS as readonly string[]).includes(value);
}

export function isExtendedBodyIdValue(value: string): value is ExtendedBodyId {
  return (EXTENDED_BODY_IDS as readonly string[]).includes(value);
}

export function isDwarfSatelliteIdValue(
  value: string,
): value is DwarfSatelliteId {
  return (DWARF_SATELLITE_IDS as readonly string[]).includes(value);
}

export function isDwarfSystemParentId(
  value: string,
): value is DwarfSystemParentId {
  return (DWARF_SYSTEM_PARENT_IDS as readonly string[]).includes(value);
}

export function isSystemRegionIdValue(value: string): value is SystemRegionId {
  return (SYSTEM_REGION_IDS as readonly string[]).includes(value);
}
