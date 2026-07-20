import type { CelestialRepresentation } from "@/features/solar-system/lib/celestial-representation";
import {
  DWARF_SATELLITE_IDS,
  DWARF_SYSTEM_PARENT_IDS,
  type DwarfSatelliteId,
  type DwarfSystemParentId,
} from "@/features/solar-system/types/celestial-body";

export { DWARF_SATELLITE_IDS, DWARF_SYSTEM_PARENT_IDS };
export type { DwarfSatelliteId, DwarfSystemParentId };

export interface DwarfSatellite {
  readonly id: DwarfSatelliteId;
  readonly parentId: DwarfSystemParentId;
  readonly name: string;
  readonly meanRadiusKm: number;
  readonly semiMajorAxisKm: number;
  readonly orbitalPeriodDays: number;
  readonly eccentricity: number | null;
  readonly inclinationDeg: number | null;
  readonly phaseAtEpochDeg: number;
  readonly sourceTarget: string;
  readonly representation: CelestialRepresentation;
  readonly sourceIds: readonly string[];
}

const J2000 = {
  julianDate: 2_451_545,
  timeScale: "TDB" as const,
  calendarLabel: "J2000.0 (JD 2451545.0 TDB)",
};

function representation(input: {
  sourceId: string;
  sourceUrl: string;
  sourceTarget: string;
  precisionNote: string;
}): CelestialRepresentation {
  return Object.freeze({
    provider: "NASA/JPL and cited system literature",
    sourceId: input.sourceId,
    sourceUrl: input.sourceUrl,
    targetCode: input.sourceTarget,
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Parent-system visual reference plane; unresolved pole angles are not synthesized",
    epoch: J2000,
    representationType: "representative-mean-elements",
    precisionNote: input.precisionNote,
    fallbackReason:
      "The source set does not provide a complete common six-element J2000 solution for every dwarf satellite. Helios uses only cited mean separation and period; unresolved plane orientation remains explicitly representative.",
  });
}

const satellite = (
  input: Omit<DwarfSatellite, "representation"> & {
    sourceUrl: string;
    precisionNote: string;
  },
): DwarfSatellite =>
  Object.freeze({
    ...input,
    representation: representation({
      sourceId: input.sourceIds[0] ?? `prompt3-${input.id}`,
      sourceUrl: input.sourceUrl,
      sourceTarget: input.sourceTarget,
      precisionNote: input.precisionNote,
    }),
  });

/**
 * Prompt 3 adds only the named dwarf-system satellites requested by the visual
 * gate. Mean separation and period support a truthful system-context animation.
 * Missing angular elements are `null`; the renderer never invents a random plane.
 */
export const DWARF_SATELLITES: readonly DwarfSatellite[] = Object.freeze([
  satellite({
    id: "dwarf-satellite-charon",
    parentId: "pluto",
    name: "Charon",
    meanRadiusKm: 606,
    semiMajorAxisKm: 19_596,
    orbitalPeriodDays: 6.3872304,
    eccentricity: 0.0002,
    inclinationDeg: null,
    phaseAtEpochDeg: 0,
    sourceTarget: "Charon (JPL target 901)",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    sourceIds: ["nasa-pluto-charon-facts", "jpl-horizons-charon"],
    precisionNote:
      "Pluto–Charon is shown around a shared visual barycentre using sourced size and mean separation. The scene is system context, not a longitude- or navigation-grade ephemeris.",
  }),
  satellite({
    id: "dwarf-satellite-dysnomia",
    parentId: "eris",
    name: "Dysnomia",
    meanRadiusKm: 350,
    semiMajorAxisKm: 37_273,
    orbitalPeriodDays: 15.7859,
    eccentricity: 0.0062,
    inclinationDeg: null,
    phaseAtEpochDeg: 40,
    sourceTarget: "Dysnomia / Eris I",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/eris/",
    sourceIds: ["nasa-eris-dysnomia-facts", "jpl-horizons-eris-system"],
    precisionNote:
      "Mean orbit scale and period are representative; a common source-backed J2000 pole solution was not available in the accepted source set.",
  }),
  satellite({
    id: "dwarf-satellite-hiiaka",
    parentId: "haumea",
    name: "Hiʻiaka",
    meanRadiusKm: 160,
    semiMajorAxisKm: 49_880,
    orbitalPeriodDays: 49.462,
    eccentricity: 0.051,
    inclinationDeg: null,
    phaseAtEpochDeg: 115,
    sourceTarget: "Haumea I Hiʻiaka",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
    sourceIds: ["nasa-haumea-system", "haumea-satellite-orbit-solution"],
    precisionNote:
      "Published mean system scale is used. The renderer does not claim a fully resolved inertial orbital plane.",
  }),
  satellite({
    id: "dwarf-satellite-namaka",
    parentId: "haumea",
    name: "Namaka",
    meanRadiusKm: 85,
    semiMajorAxisKm: 25_657,
    orbitalPeriodDays: 18.2783,
    eccentricity: 0.249,
    inclinationDeg: null,
    phaseAtEpochDeg: 248,
    sourceTarget: "Haumea II Namaka",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
    sourceIds: ["nasa-haumea-system", "haumea-satellite-orbit-solution"],
    precisionNote:
      "The non-circular mean orbit is visualized without inventing missing longitude or pole angles.",
  }),
  satellite({
    id: "dwarf-satellite-mk2",
    parentId: "makemake",
    name: "MK2",
    meanRadiusKm: 87.5,
    semiMajorAxisKm: 21_000,
    orbitalPeriodDays: 12.4,
    eccentricity: null,
    inclinationDeg: null,
    phaseAtEpochDeg: 70,
    sourceTarget: "S/2015 (136472) 1 (MK2)",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/makemake/facts/",
    sourceIds: ["nasa-makemake-mk2-discovery"],
    precisionNote:
      "Only a restrained representative separation/period context is rendered. No surface map or precise angular orbit is claimed.",
  }),
  satellite({
    id: "dwarf-satellite-weywot",
    parentId: "quaoar",
    name: "Weywot",
    meanRadiusKm: 85,
    semiMajorAxisKm: 14_500,
    orbitalPeriodDays: 12.438,
    eccentricity: 0.14,
    inclinationDeg: null,
    phaseAtEpochDeg: 190,
    sourceTarget: "(50000) Quaoar I Weywot",
    sourceUrl: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=50000",
    sourceIds: ["jpl-sbdb-quaoar", "quaoar-weywot-orbit-literature"],
    precisionNote:
      "Mean separation, period and eccentricity are representative. Unresolved orientation remains explicit rather than randomized.",
  }),
  satellite({
    id: "dwarf-satellite-xiangliu",
    parentId: "gonggong",
    name: "Xiangliu",
    meanRadiusKm: 50,
    semiMajorAxisKm: 24_020,
    orbitalPeriodDays: 25.22,
    eccentricity: 0.29,
    inclinationDeg: null,
    phaseAtEpochDeg: 310,
    sourceTarget: "(225088) Gonggong I Xiangliu",
    sourceUrl: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=225088",
    sourceIds: ["jpl-sbdb-gonggong", "gonggong-xiangliu-orbit-literature"],
    precisionNote:
      "A representative eccentric orbit is shown; pole and longitude are not asserted.",
  }),
  satellite({
    id: "dwarf-satellite-vanth",
    parentId: "orcus",
    name: "Vanth",
    meanRadiusKm: 221,
    semiMajorAxisKm: 8_980,
    orbitalPeriodDays: 9.5393,
    eccentricity: 0.007,
    inclinationDeg: null,
    phaseAtEpochDeg: 145,
    sourceTarget: "(90482) Orcus I Vanth",
    sourceUrl: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90482",
    sourceIds: ["jpl-sbdb-orcus", "orcus-vanth-orbit-literature"],
    precisionNote:
      "Mean orbit scale and period are representative. The orientation is intentionally not navigation-grade.",
  }),
]);

export const DWARF_SATELLITE_BY_ID: Readonly<Record<DwarfSatelliteId, DwarfSatellite>> =
  Object.freeze(
    Object.fromEntries(DWARF_SATELLITES.map((moon) => [moon.id, moon])) as Record<
      DwarfSatelliteId,
      DwarfSatellite
    >,
  );

export function dwarfSatellitesFor(parentId: DwarfSystemParentId) {
  return DWARF_SATELLITES.filter((moon) => moon.parentId === parentId);
}

export function isDwarfSatelliteId(value: string): value is DwarfSatelliteId {
  return (DWARF_SATELLITE_IDS as readonly string[]).includes(value);
}
