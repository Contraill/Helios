import { z } from "zod";

import {
  celestialRepresentationSchema,
  type CelestialRepresentation,
  orbitalReferenceFrameSchema,
} from "@/features/solar-system/lib/celestial-representation";
import {
  FEATURED_MOON_IDS,
  FEATURED_MOON_PARENT_IDS,
  type MoonId,
  type MoonParentPlanetId,
} from "@/features/solar-system/types/celestial-body";

export { FEATURED_MOON_IDS, FEATURED_MOON_PARENT_IDS };
export type { MoonId, MoonParentPlanetId };

const moonParentPlanetIdSchema = z.enum(FEATURED_MOON_PARENT_IDS);
const moonIdSchema = z.enum(FEATURED_MOON_IDS);

export const moonRotationSchema = z
  .object({
    kind: z.enum(["tidally-locked", "unknown"]),
    orientationSourceId: z.string().min(1),
    texturePrimeMeridianVerified: z.boolean(),
  })
  .strict();

const laplacePoleSchema = z
  .object({
    rightAscensionDeg: z.number().finite(),
    declinationDeg: z.number().min(-90).max(90),
    tiltFromParentEquatorDeg: z.number().min(0).max(180),
  })
  .strict();

const precessionSchema = z
  .object({
    apsidalPeriodYears: z.number().finite().optional(),
    nodalPeriodYears: z.number().finite().optional(),
    propagation: z.literal("metadata-only"),
  })
  .strict();

export const moonSchema = z
  .object({
    id: moonIdSchema,
    parentPlanetId: moonParentPlanetIdSchema,
    name: z.string().min(1),
    meanRadiusKm: z.number().positive(),
    semiMajorAxisKm: z.number().positive(),
    orbitalPeriodDays: z.number().positive(),
    inclinationDeg: z.number().min(0).max(180),
    eccentricity: z.number().min(0).lt(1),
    argumentOfPeriapsisDeg: z.number().finite(),
    meanAnomalyAtEpochDeg: z.number().finite(),
    longitudeAscendingNodeDeg: z.number().finite(),
    targetCode: z.string().min(1),
    ephemerisId: z.string().min(1),
    referenceFrame: orbitalReferenceFrameSchema,
    laplacePole: laplacePoleSchema.optional(),
    precession: precessionSchema,
    representation: celestialRepresentationSchema,
    visualProfile: z
      .object({
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .strict(),
    rotation: moonRotationSchema,
    sourceIds: z.array(z.string().min(1)).min(3),
  })
  .strict();

export type Moon = z.infer<typeof moonSchema>;

const ORBIT_SOURCE_ID = "jpl-planetary-satellite-mean-elements";
const PHYSICAL_SOURCE_ID = "jpl-planetary-satellite-physical-parameters";
const ORIENTATION_SOURCE_ID = "iau-rotational-elements-2015";
const SOURCE_IDS = [
  ORBIT_SOURCE_ID,
  PHYSICAL_SOURCE_ID,
  ORIENTATION_SOURCE_ID,
] as const;
const MEAN_ELEMENTS_URL = "https://ssd.jpl.nasa.gov/sats/elem/";
const J2000_EPOCH = {
  julianDate: 2_451_545,
  timeScale: "TDB" as const,
  calendarLabel: "2000-01-01.5 TDB",
};
const NEREID_EPOCH = {
  julianDate: 2_458_849.5,
  timeScale: "TDB" as const,
  calendarLabel: "2020-01-01.0 TDB",
};

interface MoonScienceMetadata {
  readonly targetCode: string;
  readonly ephemerisId: string;
  readonly referenceFrame: Moon["referenceFrame"];
  readonly referencePlane: string;
  readonly epoch: Moon["representation"]["epoch"];
  readonly laplacePole?: Moon["laplacePole"];
  readonly apsidalPeriodYears?: number;
  readonly nodalPeriodYears?: number;
  readonly recommendedRange?: Moon["representation"]["recommendedRange"];
}

const range = (start: string, end: string, ephemerisId: string) => ({
  startIso: `${start}T00:00:00.000Z`,
  endIso: `${end}T00:00:00.000Z`,
  note: `${ephemerisId} source-ephemeris coverage; the fitted mean elements remain representative rather than navigation-grade.`,
});

const laplace = (
  rightAscensionDeg: number,
  declinationDeg: number,
  tiltFromParentEquatorDeg: number,
) => ({ rightAscensionDeg, declinationDeg, tiltFromParentEquatorDeg });

const MOON_SCIENCE_METADATA = {
  "moon-earth-moon": {
    targetCode: "301",
    ephemerisId: "DE405/LE405",
    referenceFrame: "ecliptic-j2000",
    referencePlane: "Earth mean ecliptic at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 5.997,
    nodalPeriodYears: 18.6,
  },
  "moon-mars-phobos": {
    targetCode: "401",
    ephemerisId: "MAR099",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(317.7, 52.9, 0),
    apsidalPeriodYears: 1.1,
    nodalPeriodYears: 2.3,
    recommendedRange: range("1600-01-01", "2600-01-02", "MAR099"),
  },
  "moon-mars-deimos": {
    targetCode: "402",
    ephemerisId: "MAR099",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(316.6, 53.5, 0.9),
    apsidalPeriodYears: 0,
    nodalPeriodYears: 56.2,
    recommendedRange: range("1600-01-01", "2600-01-02", "MAR099"),
  },
  "moon-jupiter-io": {
    targetCode: "501",
    ephemerisId: "JUP365",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(268.1, 64.5, 0),
    apsidalPeriodYears: 1.333,
    nodalPeriodYears: 0,
    recommendedRange: range("1600-01-10", "2200-01-10", "JUP365"),
  },
  "moon-jupiter-europa": {
    targetCode: "502",
    ephemerisId: "JUP365",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(268.1, 64.5, 0),
    apsidalPeriodYears: 1.394,
    nodalPeriodYears: 30.202,
    recommendedRange: range("1600-01-10", "2200-01-10", "JUP365"),
  },
  "moon-jupiter-ganymede": {
    targetCode: "503",
    ephemerisId: "JUP365",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(268.2, 64.6, 0.1),
    apsidalPeriodYears: 68.301,
    nodalPeriodYears: 137.812,
    recommendedRange: range("1600-01-10", "2200-01-10", "JUP365"),
  },
  "moon-jupiter-callisto": {
    targetCode: "504",
    ephemerisId: "JUP365",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(268.7, 64.8, 0.4),
    apsidalPeriodYears: 277.921,
    nodalPeriodYears: 577.264,
    recommendedRange: range("1600-01-10", "2200-01-10", "JUP365"),
  },
  "moon-saturn-mimas": {
    targetCode: "601",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(40.6, 83.5, 0),
    apsidalPeriodYears: 0.493,
    nodalPeriodYears: 0.986,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-enceladus": {
    targetCode: "602",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(40.6, 83.5, 0),
    apsidalPeriodYears: 2.916,
    nodalPeriodYears: 0,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-tethys": {
    targetCode: "603",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(40.6, 83.5, 0),
    apsidalPeriodYears: 0.005,
    nodalPeriodYears: 4.982,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-dione": {
    targetCode: "604",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(40.6, 83.5, 0),
    apsidalPeriodYears: 11.698,
    nodalPeriodYears: 0,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-rhea": {
    targetCode: "605",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(40.6, 83.5, 0),
    apsidalPeriodYears: 33.939,
    nodalPeriodYears: 35.775,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-titan": {
    targetCode: "606",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(36.4, 84, 0.6),
    apsidalPeriodYears: 346.68,
    nodalPeriodYears: 687.37,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-saturn-iapetus": {
    targetCode: "608",
    ephemerisId: "SAT441",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(288.7, 78.9, 14.8),
    apsidalPeriodYears: 1662.9,
    nodalPeriodYears: 3130.302,
    recommendedRange: range("1750-01-01", "2250-01-01", "SAT441"),
  },
  "moon-uranus-miranda": {
    targetCode: "705",
    ephemerisId: "URA182",
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Uranus equator at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 8.939,
    nodalPeriodYears: 17.787,
    recommendedRange: range("1550-01-01", "2650-01-01", "URA182"),
  },
  "moon-uranus-ariel": {
    targetCode: "701",
    ephemerisId: "URA182",
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Uranus equator at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 28.901,
    nodalPeriodYears: 0,
    recommendedRange: range("1550-01-01", "2650-01-01", "URA182"),
  },
  "moon-uranus-umbriel": {
    targetCode: "702",
    ephemerisId: "URA182",
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Uranus equator at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 64.126,
    nodalPeriodYears: 129.745,
    recommendedRange: range("1550-01-01", "2650-01-01", "URA182"),
  },
  "moon-uranus-titania": {
    targetCode: "703",
    ephemerisId: "URA182",
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Uranus equator at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 579.928,
    nodalPeriodYears: 1644.649,
    recommendedRange: range("1550-01-01", "2650-01-01", "URA182"),
  },
  "moon-uranus-oberon": {
    targetCode: "704",
    ephemerisId: "URA182",
    referenceFrame: "parent-equatorial-j2000",
    referencePlane: "Uranus equator at J2000",
    epoch: J2000_EPOCH,
    apsidalPeriodYears: 158.604,
    nodalPeriodYears: 192.798,
    recommendedRange: range("1550-01-01", "2650-01-01", "URA182"),
  },
  "moon-neptune-proteus": {
    targetCode: "808",
    ephemerisId: "NEP097",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(299.8, 42.6, 0.9),
    apsidalPeriodYears: 0,
    nodalPeriodYears: 0,
    recommendedRange: range("1800-01-01", "2100-01-01", "NEP097"),
  },
  "moon-neptune-triton": {
    targetCode: "801",
    ephemerisId: "NEP097",
    referenceFrame: "local-laplace-plane",
    referencePlane: "Local Laplace plane from the JPL pole",
    epoch: J2000_EPOCH,
    laplacePole: laplace(299.8, 43.1, 0.4),
    apsidalPeriodYears: 0,
    nodalPeriodYears: 340.379,
    recommendedRange: range("1800-01-01", "2100-01-01", "NEP097"),
  },
  "moon-neptune-nereid": {
    targetCode: "802",
    ephemerisId: "NEP105",
    referenceFrame: "ecliptic-j2000",
    referencePlane: "Earth mean ecliptic at J2000",
    epoch: NEREID_EPOCH,
    apsidalPeriodYears: 7990.433,
    nodalPeriodYears: 9426.334,
    recommendedRange: range("1600-01-01", "2400-01-01", "NEP105"),
  },
} as const satisfies Record<MoonId, MoonScienceMetadata>;

type MoonInput = Omit<
  Moon,
  | "targetCode"
  | "ephemerisId"
  | "referenceFrame"
  | "laplacePole"
  | "precession"
  | "representation"
  | "sourceIds"
  | "rotation"
> & { readonly rotation: { readonly kind: "tidally-locked" | "unknown" } };

function moon(input: MoonInput): Moon {
  const science: MoonScienceMetadata = MOON_SCIENCE_METADATA[input.id];
  const representation: CelestialRepresentation = {
    provider: "NASA/JPL Solar System Dynamics",
    sourceId: ORBIT_SOURCE_ID,
    sourceUrl: MEAN_ELEMENTS_URL,
    targetCode: science.targetCode,
    ephemerisId: science.ephemerisId,
    referenceFrame: science.referenceFrame,
    referencePlane: science.referencePlane,
    epoch: science.epoch,
    recommendedRange: science.recommendedRange,
    representationType: "representative-mean-elements",
    precisionNote:
      "JPL fitted mean elements describe general orbit shape and orientation; they are not an accurate ephemeris.",
  };
  return moonSchema.parse({
    ...input,
    targetCode: science.targetCode,
    ephemerisId: science.ephemerisId,
    referenceFrame: science.referenceFrame,
    laplacePole: science.laplacePole,
    precession: {
      apsidalPeriodYears:
        science.apsidalPeriodYears && science.apsidalPeriodYears > 0
          ? science.apsidalPeriodYears
          : undefined,
      nodalPeriodYears:
        science.nodalPeriodYears && science.nodalPeriodYears > 0
          ? science.nodalPeriodYears
          : undefined,
      propagation: "metadata-only",
    },
    representation,
    rotation: {
      ...input.rotation,
      orientationSourceId: ORIENTATION_SOURCE_ID,
      texturePrimeMeridianVerified: false,
    },
    sourceIds: SOURCE_IDS,
  });
}

/**
 * Featured major moons only. Orbital values are JPL published mean elements,
 * suitable for a labelled representative orbit preview, not navigation-grade
 * ephemerides. Physical radii are JPL satellite physical parameters.
 */
export const FEATURED_MOONS: readonly Moon[] = Object.freeze([
  moon({
    id: "moon-earth-moon",
    parentPlanetId: "earth",
    name: "Moon",
    meanRadiusKm: 1737.4,
    semiMajorAxisKm: 384400,
    orbitalPeriodDays: 27.322,
    inclinationDeg: 5.16,
    eccentricity: 0.0554,
    argumentOfPeriapsisDeg: 318.15,
    meanAnomalyAtEpochDeg: 135.27,
    longitudeAscendingNodeDeg: 125.08,
    visualProfile: { color: "#b9b8b3" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-mars-phobos",
    parentPlanetId: "mars",
    name: "Phobos",
    meanRadiusKm: 11.08,
    semiMajorAxisKm: 9375,
    orbitalPeriodDays: 0.3187,
    inclinationDeg: 1.1,
    eccentricity: 0.015,
    argumentOfPeriapsisDeg: 216.3,
    meanAnomalyAtEpochDeg: 189.7,
    longitudeAscendingNodeDeg: 169.2,
    visualProfile: { color: "#756c62" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-mars-deimos",
    parentPlanetId: "mars",
    name: "Deimos",
    meanRadiusKm: 6.2,
    semiMajorAxisKm: 23457,
    orbitalPeriodDays: 1.2625,
    inclinationDeg: 1.8,
    eccentricity: 0,
    argumentOfPeriapsisDeg: 0,
    meanAnomalyAtEpochDeg: 205,
    longitudeAscendingNodeDeg: 54.3,
    visualProfile: { color: "#968779" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-jupiter-io",
    parentPlanetId: "jupiter",
    name: "Io",
    meanRadiusKm: 1821.49,
    semiMajorAxisKm: 421800,
    orbitalPeriodDays: 1.762732,
    inclinationDeg: 0,
    eccentricity: 0.004,
    argumentOfPeriapsisDeg: 49.1,
    meanAnomalyAtEpochDeg: 330.9,
    longitudeAscendingNodeDeg: 0,
    visualProfile: { color: "#d6b249" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-jupiter-europa",
    parentPlanetId: "jupiter",
    name: "Europa",
    meanRadiusKm: 1560.8,
    semiMajorAxisKm: 671100,
    orbitalPeriodDays: 3.525463,
    inclinationDeg: 0.5,
    eccentricity: 0.009,
    argumentOfPeriapsisDeg: 45,
    meanAnomalyAtEpochDeg: 345.4,
    longitudeAscendingNodeDeg: 184,
    visualProfile: { color: "#d7c8a9" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-jupiter-ganymede",
    parentPlanetId: "jupiter",
    name: "Ganymede",
    meanRadiusKm: 2631.2,
    semiMajorAxisKm: 1070400,
    orbitalPeriodDays: 7.155588,
    inclinationDeg: 0.2,
    eccentricity: 0.001,
    argumentOfPeriapsisDeg: 198.3,
    meanAnomalyAtEpochDeg: 324.8,
    longitudeAscendingNodeDeg: 58.5,
    visualProfile: { color: "#8b8173" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-jupiter-callisto",
    parentPlanetId: "jupiter",
    name: "Callisto",
    meanRadiusKm: 2410.3,
    semiMajorAxisKm: 1882700,
    orbitalPeriodDays: 16.69044,
    inclinationDeg: 0.3,
    eccentricity: 0.007,
    argumentOfPeriapsisDeg: 43.8,
    meanAnomalyAtEpochDeg: 87.4,
    longitudeAscendingNodeDeg: 309.1,
    visualProfile: { color: "#59534e" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-mimas",
    parentPlanetId: "saturn",
    name: "Mimas",
    meanRadiusKm: 198.2,
    semiMajorAxisKm: 186000,
    orbitalPeriodDays: 0.942422,
    inclinationDeg: 1.6,
    eccentricity: 0.02,
    argumentOfPeriapsisDeg: 160.4,
    meanAnomalyAtEpochDeg: 275.3,
    longitudeAscendingNodeDeg: 66.2,
    visualProfile: { color: "#c6c2b5" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-enceladus",
    parentPlanetId: "saturn",
    name: "Enceladus",
    meanRadiusKm: 252.1,
    semiMajorAxisKm: 238400,
    orbitalPeriodDays: 1.370218,
    inclinationDeg: 0,
    eccentricity: 0.005,
    argumentOfPeriapsisDeg: 119.5,
    meanAnomalyAtEpochDeg: 57,
    longitudeAscendingNodeDeg: 0,
    visualProfile: { color: "#e3e7e8" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-tethys",
    parentPlanetId: "saturn",
    name: "Tethys",
    meanRadiusKm: 531.1,
    semiMajorAxisKm: 295000,
    orbitalPeriodDays: 1.887802,
    inclinationDeg: 1.1,
    eccentricity: 0.001,
    argumentOfPeriapsisDeg: 335.3,
    meanAnomalyAtEpochDeg: 0,
    longitudeAscendingNodeDeg: 273,
    visualProfile: { color: "#c9c7bf" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-dione",
    parentPlanetId: "saturn",
    name: "Dione",
    meanRadiusKm: 561.4,
    semiMajorAxisKm: 377700,
    orbitalPeriodDays: 2.736916,
    inclinationDeg: 0,
    eccentricity: 0.002,
    argumentOfPeriapsisDeg: 116,
    meanAnomalyAtEpochDeg: 212,
    longitudeAscendingNodeDeg: 0,
    visualProfile: { color: "#bfc2c0" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-rhea",
    parentPlanetId: "saturn",
    name: "Rhea",
    meanRadiusKm: 763.5,
    semiMajorAxisKm: 527200,
    orbitalPeriodDays: 4.517503,
    inclinationDeg: 0.3,
    eccentricity: 0.001,
    argumentOfPeriapsisDeg: 44.3,
    meanAnomalyAtEpochDeg: 31.5,
    longitudeAscendingNodeDeg: 133.7,
    visualProfile: { color: "#aaa9a4" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-titan",
    parentPlanetId: "saturn",
    name: "Titan",
    meanRadiusKm: 2574.76,
    semiMajorAxisKm: 1221900,
    orbitalPeriodDays: 15.945448,
    inclinationDeg: 0.3,
    eccentricity: 0.029,
    argumentOfPeriapsisDeg: 78.3,
    meanAnomalyAtEpochDeg: 11.7,
    longitudeAscendingNodeDeg: 78.6,
    visualProfile: { color: "#c58b45" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-saturn-iapetus",
    parentPlanetId: "saturn",
    name: "Iapetus",
    meanRadiusKm: 734.3,
    semiMajorAxisKm: 3561700,
    orbitalPeriodDays: 79.331002,
    inclinationDeg: 7.6,
    eccentricity: 0.028,
    argumentOfPeriapsisDeg: 254.5,
    meanAnomalyAtEpochDeg: 74.8,
    longitudeAscendingNodeDeg: 86.5,
    visualProfile: { color: "#81766b" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-uranus-miranda",
    parentPlanetId: "uranus",
    name: "Miranda",
    meanRadiusKm: 235.8,
    semiMajorAxisKm: 129846,
    orbitalPeriodDays: 1.413479,
    inclinationDeg: 4.4,
    eccentricity: 0.001,
    argumentOfPeriapsisDeg: 154.8,
    meanAnomalyAtEpochDeg: 73,
    longitudeAscendingNodeDeg: 100.9,
    visualProfile: { color: "#b8bec0" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-uranus-ariel",
    parentPlanetId: "uranus",
    name: "Ariel",
    meanRadiusKm: 578.9,
    semiMajorAxisKm: 190929,
    orbitalPeriodDays: 2.520379,
    inclinationDeg: 0,
    eccentricity: 0.001,
    argumentOfPeriapsisDeg: 9.6,
    meanAnomalyAtEpochDeg: 193.5,
    longitudeAscendingNodeDeg: 0,
    visualProfile: { color: "#c6ccce" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-uranus-umbriel",
    parentPlanetId: "uranus",
    name: "Umbriel",
    meanRadiusKm: 584.7,
    semiMajorAxisKm: 265986,
    orbitalPeriodDays: 4.144177,
    inclinationDeg: 0.1,
    eccentricity: 0.004,
    argumentOfPeriapsisDeg: 183.4,
    meanAnomalyAtEpochDeg: 253,
    longitudeAscendingNodeDeg: 174.8,
    visualProfile: { color: "#646b70" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-uranus-titania",
    parentPlanetId: "uranus",
    name: "Titania",
    meanRadiusKm: 788.9,
    semiMajorAxisKm: 436298,
    orbitalPeriodDays: 8.705869,
    inclinationDeg: 0.1,
    eccentricity: 0.002,
    argumentOfPeriapsisDeg: 184,
    meanAnomalyAtEpochDeg: 68.1,
    longitudeAscendingNodeDeg: 29.5,
    visualProfile: { color: "#92999b" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-uranus-oberon",
    parentPlanetId: "uranus",
    name: "Oberon",
    meanRadiusKm: 761.4,
    semiMajorAxisKm: 583511,
    orbitalPeriodDays: 13.463237,
    inclinationDeg: 0.1,
    eccentricity: 0.002,
    argumentOfPeriapsisDeg: 132.2,
    meanAnomalyAtEpochDeg: 143.6,
    longitudeAscendingNodeDeg: 76.8,
    visualProfile: { color: "#737a7d" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-neptune-proteus",
    parentPlanetId: "neptune",
    name: "Proteus",
    meanRadiusKm: 208,
    semiMajorAxisKm: 117600,
    orbitalPeriodDays: 1.122315,
    inclinationDeg: 0,
    eccentricity: 0,
    argumentOfPeriapsisDeg: 0,
    meanAnomalyAtEpochDeg: 276.8,
    longitudeAscendingNodeDeg: 0,
    visualProfile: { color: "#686d74" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-neptune-triton",
    parentPlanetId: "neptune",
    name: "Triton",
    meanRadiusKm: 1352.6,
    semiMajorAxisKm: 354800,
    orbitalPeriodDays: 5.876994,
    inclinationDeg: 157.3,
    eccentricity: 0,
    argumentOfPeriapsisDeg: 0,
    meanAnomalyAtEpochDeg: 63,
    longitudeAscendingNodeDeg: 178.1,
    visualProfile: { color: "#c7b9b4" },
    rotation: { kind: "tidally-locked" },
  }),
  moon({
    id: "moon-neptune-nereid",
    parentPlanetId: "neptune",
    name: "Nereid",
    meanRadiusKm: 170,
    semiMajorAxisKm: 5513900,
    orbitalPeriodDays: 360.133039,
    inclinationDeg: 5.1,
    eccentricity: 0.751,
    argumentOfPeriapsisDeg: 296.8,
    meanAnomalyAtEpochDeg: 318.5,
    longitudeAscendingNodeDeg: 319.5,
    visualProfile: { color: "#9ca3a6" },
    rotation: { kind: "unknown" },
  }),
]);

export const featuredMoonById = new Map(
  FEATURED_MOONS.map((entry) => [entry.id, entry] as const),
);

export const MOON_BY_ID = Object.freeze(
  Object.fromEntries(
    FEATURED_MOONS.map((entry) => [entry.id, entry]),
  ) as Record<MoonId, Moon>,
);

export function isFeaturedMoonParentPlanetId(
  value: string,
): value is MoonParentPlanetId {
  return FEATURED_MOON_PARENT_IDS.includes(value as MoonParentPlanetId);
}

export function featuredMoonsForPlanet(
  parentPlanetId: MoonParentPlanetId,
): readonly Moon[] {
  return FEATURED_MOONS.filter(
    (entry) => entry.parentPlanetId === parentPlanetId,
  );
}

export function isMoonId(value: string): value is MoonId {
  return featuredMoonById.has(value as MoonId);
}
