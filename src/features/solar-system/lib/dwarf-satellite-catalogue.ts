import type { CelestialRepresentation } from "@/features/solar-system/lib/celestial-representation";
import type { VisualRotationProfile } from "@/features/solar-system/lib/visual-rotation-policy";
import {
  DWARF_SATELLITE_IDS,
  DWARF_SYSTEM_PARENT_IDS,
  type DwarfSatelliteId,
  type DwarfSystemParentId,
} from "@/features/solar-system/types/celestial-body";

export { DWARF_SATELLITE_IDS, DWARF_SYSTEM_PARENT_IDS };
export type { DwarfSatelliteId, DwarfSystemParentId };

export type DwarfSatelliteOrbitPlaneStatus =
  | "source-backed-parent-equatorial"
  | "representative-parent-equatorial-unresolved";

export interface DwarfSatellite {
  readonly id: DwarfSatelliteId;
  readonly parentId: DwarfSystemParentId;
  readonly name: string;
  readonly meanRadiusKm: number;
  readonly semiMajorAxisKm: number;
  readonly orbitalPeriodDays: number;
  readonly eccentricity: number | null;
  readonly inclinationDeg: number | null;
  readonly orbitPlaneStatus: DwarfSatelliteOrbitPlaneStatus;
  readonly orbitPlaneReference: string;
  readonly orbitPlaneSourceId: string | null;
  readonly orbitPlaneSourceUrl: string | null;
  readonly phaseAtEpochDeg: number;
  readonly rotation: VisualRotationProfile;
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
  orbitPlaneStatus: DwarfSatelliteOrbitPlaneStatus;
  orbitPlaneReference: string;
}): CelestialRepresentation {
  return Object.freeze({
    provider: "NASA/JPL and cited system literature",
    sourceId: input.sourceId,
    sourceUrl: input.sourceUrl,
    targetCode: input.sourceTarget,
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: input.orbitPlaneReference,
    epoch: J2000,
    representationType: "representative-mean-elements",
    precisionNote: input.precisionNote,
    fallbackReason:
      input.orbitPlaneStatus === "source-backed-parent-equatorial"
        ? "The inclination is source-backed relative to the parent equator; missing node/periapsis angles remain representative rather than navigation-grade."
        : "The source set does not provide a complete parent-equatorial plane solution. Helios uses cited mean separation and period while keeping the unresolved visual plane explicit.",
  });
}

const fixedUnknownRotation = (id: DwarfSatelliteId): VisualRotationProfile => ({
  kind: "fixed-unknown",
  sourceId: `helios-rotation-unknown-${id}`,
  note: "The accepted source set does not establish a navigation-grade rotation or tidal-lock solution; the visual orientation remains fixed.",
});

const satellite = (
  input: Omit<DwarfSatellite, "representation" | "rotation"> & {
    sourceUrl: string;
    precisionNote: string;
    rotation?: VisualRotationProfile;
  },
): DwarfSatellite =>
  Object.freeze({
    ...input,
    rotation: input.rotation ?? fixedUnknownRotation(input.id),
    representation: representation({
      sourceId: input.sourceIds[0] ?? `helios-visual-${input.id}`,
      sourceUrl: input.sourceUrl,
      sourceTarget: input.sourceTarget,
      precisionNote: input.precisionNote,
      orbitPlaneStatus: input.orbitPlaneStatus,
      orbitPlaneReference: input.orbitPlaneReference,
    }),
  });

/**
 * Mean separation and period support system-context motion. Missing angular
 * elements remain null; unresolved planes and rotations are never randomized.
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
    inclinationDeg: 0,
    orbitPlaneStatus: "source-backed-parent-equatorial",
    orbitPlaneReference: "Pluto equatorial plane",
    orbitPlaneSourceId: "nasa-nssdc-pluto-fact-sheet",
    orbitPlaneSourceUrl:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html",
    phaseAtEpochDeg: 0,
    rotation: { kind: "tidally-locked", sourceId: "nasa-pluto-charon-facts" },
    sourceTarget: "Charon (JPL target 901)",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    sourceIds: ["nasa-pluto-charon-facts", "jpl-horizons-charon"],
    precisionNote:
      "Pluto–Charon is shown around a shared visual barycentre using sourced size, mean separation and a source-backed near-zero inclination to Pluto's equator. Node/periapsis orientation remains representative.",
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
    orbitPlaneStatus: "representative-parent-equatorial-unresolved",
    orbitPlaneReference:
      "Representative parent-equatorial visual plane; source-backed pole unresolved",
    orbitPlaneSourceId: null,
    orbitPlaneSourceUrl: null,
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
    inclinationDeg: 2,
    orbitPlaneStatus: "source-backed-parent-equatorial",
    orbitPlaneReference: "Haumea equatorial plane",
    orbitPlaneSourceId: "mnras-haumea-ring-perturbation-maps",
    orbitPlaneSourceUrl:
      "https://academic.oup.com/mnras/article/496/2/2085/5858006",
    phaseAtEpochDeg: 115,
    sourceTarget: "Haumea I Hiʻiaka",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
    sourceIds: ["nasa-haumea-system", "haumea-satellite-orbit-solution"],
    precisionNote:
      "Published mean system scale and the 2° inclination to Haumea's equator are used. Missing node/periapsis orientation remains representative.",
  }),
  satellite({
    id: "dwarf-satellite-namaka",
    parentId: "haumea",
    name: "Namaka",
    meanRadiusKm: 85,
    semiMajorAxisKm: 25_657,
    orbitalPeriodDays: 18.2783,
    eccentricity: 0.249,
    inclinationDeg: 13,
    orbitPlaneStatus: "source-backed-parent-equatorial",
    orbitPlaneReference: "Haumea equatorial plane",
    orbitPlaneSourceId: "mnras-haumea-ring-perturbation-maps",
    orbitPlaneSourceUrl:
      "https://academic.oup.com/mnras/article/496/2/2085/5858006",
    phaseAtEpochDeg: 248,
    sourceTarget: "Haumea II Namaka",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
    sourceIds: ["nasa-haumea-system", "haumea-satellite-orbit-solution"],
    precisionNote:
      "The non-circular mean orbit and 13° inclination to Haumea's equator are used without inventing missing node/periapsis angles.",
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
    orbitPlaneStatus: "representative-parent-equatorial-unresolved",
    orbitPlaneReference:
      "Representative parent-equatorial visual plane; source-backed pole unresolved",
    orbitPlaneSourceId: null,
    orbitPlaneSourceUrl: null,
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
    orbitPlaneStatus: "representative-parent-equatorial-unresolved",
    orbitPlaneReference:
      "Representative parent-equatorial visual plane; source-backed pole unresolved",
    orbitPlaneSourceId: null,
    orbitPlaneSourceUrl: null,
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
    orbitPlaneStatus: "representative-parent-equatorial-unresolved",
    orbitPlaneReference:
      "Representative parent-equatorial visual plane; source-backed pole unresolved",
    orbitPlaneSourceId: null,
    orbitPlaneSourceUrl: null,
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
    orbitPlaneStatus: "representative-parent-equatorial-unresolved",
    orbitPlaneReference:
      "Representative parent-equatorial visual plane; source-backed pole unresolved",
    orbitPlaneSourceId: null,
    orbitPlaneSourceUrl: null,
    phaseAtEpochDeg: 145,
    sourceTarget: "(90482) Orcus I Vanth",
    sourceUrl: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=90482",
    sourceIds: ["jpl-sbdb-orcus", "orcus-vanth-orbit-literature"],
    precisionNote:
      "Mean orbit scale and period are representative. The orientation is intentionally not navigation-grade.",
  }),
]);

export const DWARF_SATELLITE_BY_ID: Readonly<
  Record<DwarfSatelliteId, DwarfSatellite>
> = Object.freeze(
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
