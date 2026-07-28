import { planetIds } from "@/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
} from "@/features/solar-system/types/celestial-body";

export const CELESTIAL_SCOPE = Object.freeze({
  planets: planetIds.length,
  featuredMoons: FEATURED_MOON_IDS.length,
  extendedBodies: EXTENDED_BODY_IDS.length,
  dwarfSatellites: DWARF_SATELLITE_IDS.length,
  realBodies:
    1 +
    planetIds.length +
    FEATURED_MOON_IDS.length +
    EXTENDED_BODY_IDS.length +
    DWARF_SATELLITE_IDS.length,
  systemRegions: SYSTEM_REGION_IDS.length,
  detailDestinations:
    1 +
    planetIds.length +
    FEATURED_MOON_IDS.length +
    EXTENDED_BODY_IDS.length +
    DWARF_SATELLITE_IDS.length +
    SYSTEM_REGION_IDS.length,
});
