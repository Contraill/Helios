import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { ExtendedBodyId } from "@/features/solar-system/types/celestial-body";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";

import type { CelestialRepresentation } from "./celestial-representation";
import {
  EllipticOrbitEvaluator,
  type EllipticOrbitElements,
  type KeplerSolution,
} from "./elliptic-orbit-evaluator";
import { referenceBasis } from "./reference-frame-math";

export type {
  ExtendedBodyId,
  SystemRegionId,
} from "@/features/solar-system/types/celestial-body";

export type ExtendedBodyKind =
  "dwarf-planet" | "asteroid" | "kuiper-object" | "comet";

export interface ExtendedBody {
  readonly id: ExtendedBodyId;
  readonly name: string;
  readonly kind: ExtendedBodyKind;
  readonly tagline: string;
  readonly description: string;
  readonly meanRadiusKm: number;
  readonly color: string;
  readonly sourceUrl: string;
  readonly elements: EllipticOrbitElements;
  readonly representation: CelestialRepresentation;
  /** Convenience mirrors retained for editorial routes and compact summaries. */
  readonly semiMajorAxisAu: number;
  readonly eccentricity: number;
  readonly inclinationDeg: number;
}

export interface ExtendedBodyPositionResult {
  readonly position: [number, number, number];
  readonly physicalAu: [number, number, number];
  readonly solver: KeplerSolution;
}

export interface CometTailState {
  /** Unit vector in rendered Three.js coordinates, pointing away from the Sun. */
  readonly antiSolarDirection: [number, number, number];
  readonly heliocentricDistanceAu: number;
  readonly activity: number;
  readonly lengthScale: number;
  readonly visible: boolean;
}

export function extendedBodySceneLabel(body: ExtendedBody): string {
  return body.id === "67p" ? "67P" : body.name;
}

const NASA_SMALL_BODIES = "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html";
const SBDB_API = "https://ssd-api.jpl.nasa.gov/sbdb.api";
const SBDB_SOURCE_ID = "jpl-sbdb-orbital-elements";
const ACCEPTED_FALLBACK_SOURCE_ID = "helios-accepted-orbital-fallback";
const J2000_EPOCH = {
  julianDate: 2_451_545,
  timeScale: "TDB" as const,
  calendarLabel: "J2000.0 (JD 2451545.0 TDB)",
};
const SAMPLE_EPOCH_2010 = {
  julianDate: 2_455_400.5,
  timeScale: "TDB" as const,
  calendarLabel: "JD 2455400.5 TDB",
};

function periodDays(semiMajorAxisAu: number): number {
  return 365.2568983 * Math.pow(semiMajorAxisAu, 1.5);
}

function elements(
  input: Omit<EllipticOrbitElements, "orbitalPeriodDays">,
): EllipticOrbitElements {
  return Object.freeze({
    ...input,
    orbitalPeriodDays: periodDays(input.semiMajorAxis),
  });
}

function representation(input: {
  targetCode: string;
  sourceUrl?: string;
  epoch: CelestialRepresentation["epoch"];
  directJplSample?: boolean;
  note?: string;
  fallbackReason?: string;
}): CelestialRepresentation {
  const directJplSample = input.directJplSample === true;
  return Object.freeze({
    provider: directJplSample
      ? "NASA/JPL Solar System Dynamics"
      : "Helios accepted catalogue fallback",
    sourceId: directJplSample ? SBDB_SOURCE_ID : ACCEPTED_FALLBACK_SOURCE_ID,
    sourceUrl:
      input.sourceUrl ??
      `${SBDB_API}?sstr=${encodeURIComponent(input.targetCode)}&full-prec=1`,
    targetCode: input.targetCode,
    referenceFrame: "ecliptic-j2000",
    referencePlane: "Heliocentric Earth mean ecliptic and equinox of J2000",
    epoch: input.epoch,
    representationType: directJplSample
      ? "representative-mean-elements"
      : "verified-fallback",
    precisionNote:
      input.note ??
      (directJplSample
        ? "A published JPL SBDB sample element set is propagated with a two-body solver for visual preview only; use Horizons for accurate ephemerides."
        : "An accepted frozen six-element preview is retained to preserve the existing body scope. It was not freshly re-fetched from SBDB in this build environment and must not be presented as an accurate or current ephemeris."),
    fallbackReason:
      input.fallbackReason ??
      (directJplSample
        ? undefined
        : "A fresh machine-readable SBDB response was unavailable in the build environment; the accepted catalogue snapshot remains explicitly isolated as a fallback preview."),
  });
}

function body(
  input: Omit<
    ExtendedBody,
    "semiMajorAxisAu" | "eccentricity" | "inclinationDeg"
  >,
): ExtendedBody {
  return Object.freeze({
    ...input,
    semiMajorAxisAu: input.elements.semiMajorAxis,
    eccentricity: input.elements.eccentricity,
    inclinationDeg: input.elements.inclinationDeg,
  });
}

/**
 * Existing featured extended-body scope only. Ceres, Pallas, Halley and Encke
 * use element examples published directly by JPL. The other accepted catalogue
 * records remain explicit `verified-fallback` previews: their six-element
 * values preserve the accepted scene but were not freshly re-fetched in this
 * build environment. No fallback record is labelled current or accurate.
 */
export const EXTENDED_BODIES: readonly ExtendedBody[] = Object.freeze([
  body({
    id: "ceres",
    name: "Ceres",
    kind: "dwarf-planet",
    tagline: "The largest world in the asteroid belt.",
    description:
      "Ceres is a differentiated dwarf planet and the only dwarf planet in the inner Solar System.",
    meanRadiusKm: 469.7,
    color: "#a89b8a",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/ceres/",
    elements: elements({
      semiMajorAxis: 2.7653485,
      eccentricity: 0.07913825,
      inclinationDeg: 10.58682,
      longitudeAscendingNodeDeg: 80.3932,
      argumentOfPeriapsisDeg: 72.58981,
      meanAnomalyAtEpochDeg: 113.4104434,
      epochJulianDateTdb: SAMPLE_EPOCH_2010.julianDate,
    }),
    representation: representation({
      targetCode: "1",
      epoch: SAMPLE_EPOCH_2010,
      directJplSample: true,
    }),
  }),
  body({
    id: "vesta",
    name: "Vesta",
    kind: "asteroid",
    tagline: "A battered protoplanet with a giant south-polar basin.",
    description:
      "Vesta is the second-largest body in the main belt by mass and was visited by Dawn.",
    meanRadiusKm: 262.7,
    color: "#b8afa2",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 2.3615,
      eccentricity: 0.08874,
      inclinationDeg: 7.1404,
      longitudeAscendingNodeDeg: 103.8514,
      argumentOfPeriapsisDeg: 150.987,
      meanAnomalyAtEpochDeg: 151,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "4",
      epoch: J2000_EPOCH,
      fallbackReason:
        "The accepted catalogue phase is retained from a frozen JPL-aligned snapshot because a fresh SBDB payload was unavailable in the build environment.",
    }),
  }),
  body({
    id: "pallas",
    name: "Pallas",
    kind: "asteroid",
    tagline: "A highly inclined main-belt world.",
    description:
      "Pallas follows a noticeably tilted and eccentric orbit through the asteroid belt.",
    meanRadiusKm: 256,
    color: "#8d928f",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 2.7721532,
      eccentricity: 0.23099956,
      inclinationDeg: 34.8409,
      longitudeAscendingNodeDeg: 173.1295,
      argumentOfPeriapsisDeg: 310.15094,
      meanAnomalyAtEpochDeg: 96.148266,
      epochJulianDateTdb: SAMPLE_EPOCH_2010.julianDate,
    }),
    representation: representation({
      targetCode: "2",
      epoch: SAMPLE_EPOCH_2010,
      directJplSample: true,
    }),
  }),
  body({
    id: "hygiea",
    name: "Hygiea",
    kind: "asteroid",
    tagline: "A dark, nearly spherical outer-belt body.",
    description:
      "Hygiea is the largest member of a carbon-rich asteroid family in the outer main belt.",
    meanRadiusKm: 216.5,
    color: "#686963",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 3.141,
      eccentricity: 0.112,
      inclinationDeg: 3.83,
      longitudeAscendingNodeDeg: 283.2,
      argumentOfPeriapsisDeg: 312.3,
      meanAnomalyAtEpochDeg: 248,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "10",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained; not an accurate current ephemeris.",
    }),
  }),
  body({
    id: "pluto",
    name: "Pluto",
    kind: "dwarf-planet",
    tagline: "A complex, active world at the Kuiper belt's inner frontier.",
    description:
      "Pluto has mountains, glaciers, haze layers and a resonant orbit beyond Neptune.",
    meanRadiusKm: 1188.3,
    color: "#d2b89d",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/",
    elements: elements({
      semiMajorAxis: 39.482,
      eccentricity: 0.2488,
      inclinationDeg: 17.16,
      longitudeAscendingNodeDeg: 110.299,
      argumentOfPeriapsisDeg: 113.834,
      meanAnomalyAtEpochDeg: 14.53,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "134340",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for the existing preview.",
    }),
  }),
  body({
    id: "eris",
    name: "Eris",
    kind: "dwarf-planet",
    tagline: "A massive dwarf planet on a distant tilted orbit.",
    description:
      "Eris helped trigger the modern definition of a planet and spends most of its orbit far beyond Pluto.",
    meanRadiusKm: 1163,
    color: "#d8d9d5",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/eris/",
    elements: elements({
      semiMajorAxis: 67.78,
      eccentricity: 0.4407,
      inclinationDeg: 44.04,
      longitudeAscendingNodeDeg: 35.951,
      argumentOfPeriapsisDeg: 151.639,
      meanAnomalyAtEpochDeg: 205,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "136199",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "haumea",
    name: "Haumea",
    kind: "dwarf-planet",
    tagline: "A rapidly rotating, elongated dwarf planet.",
    description:
      "Haumea's fast spin produces an unusual elongated shape; it also has a ring and moons.",
    meanRadiusKm: 780,
    color: "#cdd8dc",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
    elements: elements({
      semiMajorAxis: 43.218,
      eccentricity: 0.191,
      inclinationDeg: 28.19,
      longitudeAscendingNodeDeg: 121.9,
      argumentOfPeriapsisDeg: 240.8,
      meanAnomalyAtEpochDeg: 219,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "136108",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "makemake",
    name: "Makemake",
    kind: "dwarf-planet",
    tagline: "A bright methane-rich Kuiper belt world.",
    description:
      "Makemake is one of the largest known objects in the classical Kuiper belt.",
    meanRadiusKm: 715,
    color: "#c77b58",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/makemake/",
    elements: elements({
      semiMajorAxis: 45.43,
      eccentricity: 0.159,
      inclinationDeg: 28.98,
      longitudeAscendingNodeDeg: 79.62,
      argumentOfPeriapsisDeg: 294.83,
      meanAnomalyAtEpochDeg: 165,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "136472",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "quaoar",
    name: "Quaoar",
    kind: "kuiper-object",
    tagline: "A large classical Kuiper belt object with a distant ring.",
    description:
      "Quaoar is a rounded trans-Neptunian world with a moon and an unexpectedly distant ring.",
    meanRadiusKm: 555,
    color: "#aa8068",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 43.69,
      eccentricity: 0.039,
      inclinationDeg: 7.99,
      longitudeAscendingNodeDeg: 188.9,
      argumentOfPeriapsisDeg: 147.5,
      meanAnomalyAtEpochDeg: 112,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "50000",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "gonggong",
    name: "Gonggong",
    kind: "kuiper-object",
    tagline: "A reddish scattered-disk world on an eccentric orbit.",
    description:
      "Gonggong is a large trans-Neptunian object with water-ice signatures and a small moon.",
    meanRadiusKm: 615,
    color: "#9e5141",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 67.5,
      eccentricity: 0.5,
      inclinationDeg: 30.7,
      longitudeAscendingNodeDeg: 336.8,
      argumentOfPeriapsisDeg: 207.7,
      meanAnomalyAtEpochDeg: 96,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "225088",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "sedna",
    name: "Sedna",
    kind: "kuiper-object",
    tagline:
      "An extreme detached object from the Solar System's remote frontier.",
    description:
      "Sedna's enormous, eccentric orbit may preserve evidence of the early Solar System's environment.",
    meanRadiusKm: 500,
    color: "#9a4d42",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 506.8,
      eccentricity: 0.855,
      inclinationDeg: 11.93,
      longitudeAscendingNodeDeg: 144.55,
      argumentOfPeriapsisDeg: 311.5,
      meanAnomalyAtEpochDeg: 358,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "90377",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained; long two-body extrapolation is especially approximate.",
    }),
  }),
  body({
    id: "orcus",
    name: "Orcus",
    kind: "kuiper-object",
    tagline: "A resonant companion to Pluto's orbital family.",
    description:
      "Orcus occupies a 2:3 resonance with Neptune and has a large moon, Vanth.",
    meanRadiusKm: 455,
    color: "#96999d",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 39.17,
      eccentricity: 0.227,
      inclinationDeg: 20.59,
      longitudeAscendingNodeDeg: 268.8,
      argumentOfPeriapsisDeg: 72.3,
      meanAnomalyAtEpochDeg: 181,
      epochJulianDateTdb: J2000_EPOCH.julianDate,
    }),
    representation: representation({
      targetCode: "90482",
      epoch: J2000_EPOCH,
      fallbackReason:
        "Frozen JPL-aligned element snapshot retained for representative preview.",
    }),
  }),
  body({
    id: "halley",
    name: "Halley",
    kind: "comet",
    tagline: "The best-known returning comet.",
    description:
      "Halley's retrograde orbit brings it through the inner Solar System roughly every 76 years.",
    meanRadiusKm: 5.5,
    color: "#d8e9e8",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 17.834145081,
      eccentricity: 0.96714291,
      inclinationDeg: 162.26269,
      longitudeAscendingNodeDeg: 58.42008,
      argumentOfPeriapsisDeg: 111.33249,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_446_467.3953125,
    }),
    representation: representation({
      targetCode: "1P",
      directJplSample: true,
      epoch: {
        julianDate: 2_446_467.3953125,
        timeScale: "TDB",
        calendarLabel: "1986-02-05.895 TDB perihelion",
      },
    }),
  }),
  body({
    id: "hale-bopp",
    name: "Hale–Bopp",
    kind: "comet",
    tagline: "A great long-period comet with a vast orbital path.",
    description:
      "Hale–Bopp's 1997 apparition displayed prominent, physically distinct dust and ion tails.",
    meanRadiusKm: 30,
    color: "#d8f0ff",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 182.8,
      eccentricity: 0.995,
      inclinationDeg: 89.4,
      longitudeAscendingNodeDeg: 282.47,
      argumentOfPeriapsisDeg: 130.59,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_450_539.5,
    }),
    representation: representation({
      targetCode: "C/1995 O1",
      epoch: {
        julianDate: 2_450_539.5,
        timeScale: "TDB",
        calendarLabel: "1997-04-01 TDB perihelion",
      },
      fallbackReason:
        "Frozen JPL-aligned comet snapshot; non-gravitational terms are not propagated.",
    }),
  }),
  body({
    id: "encke",
    name: "Encke",
    kind: "comet",
    tagline: "A short-period comet returning every 3.3 years.",
    description:
      "Encke has one of the shortest known comet periods and feeds the Taurid meteoroid complex.",
    meanRadiusKm: 2.4,
    color: "#cde5d4",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 2.2144931404,
      eccentricity: 0.84833156,
      inclinationDeg: 11.78308,
      longitudeAscendingNodeDeg: 334.56582,
      argumentOfPeriapsisDeg: 186.5497,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_455_415.001956,
    }),
    representation: representation({
      targetCode: "2P",
      directJplSample: true,
      epoch: {
        julianDate: 2_455_415.001956,
        timeScale: "TDB",
        calendarLabel: "2010-08-06.502 TDB perihelion",
      },
    }),
  }),
  body({
    id: "67p",
    name: "67P/Churyumov–Gerasimenko",
    kind: "comet",
    tagline: "Rosetta's bilobed comet.",
    description:
      "67P was orbited and landed on by ESA's Rosetta mission, revealing a porous, active nucleus.",
    meanRadiusKm: 2,
    color: "#bec6bb",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 3.4624,
      eccentricity: 0.641,
      inclinationDeg: 7.04,
      longitudeAscendingNodeDeg: 50.18,
      argumentOfPeriapsisDeg: 12.78,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_459_520.5,
    }),
    representation: representation({
      targetCode: "67P",
      epoch: {
        julianDate: 2_459_520.5,
        timeScale: "TDB",
        calendarLabel: "2021-11-02 TDB perihelion",
      },
      fallbackReason:
        "Frozen JPL-aligned comet snapshot; outgassing parameters are not propagated.",
    }),
  }),
  body({
    id: "neowise",
    name: "NEOWISE",
    kind: "comet",
    tagline: "The bright northern-sky comet of 2020.",
    description:
      "C/2020 F3 NEOWISE is a long-period comet whose dust and ion tails were widely observed.",
    meanRadiusKm: 2.5,
    color: "#e4d7b8",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 368.475,
      eccentricity: 0.9992,
      inclinationDeg: 128.94,
      longitudeAscendingNodeDeg: 61.01,
      argumentOfPeriapsisDeg: 37.28,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_459_033.5,
    }),
    representation: representation({
      targetCode: "C/2020 F3",
      epoch: {
        julianDate: 2_459_033.5,
        timeScale: "TDB",
        calendarLabel: "2020-07-03 TDB perihelion",
      },
      fallbackReason:
        "Frozen JPL-aligned comet snapshot; long-period two-body propagation is only illustrative.",
    }),
  }),
  body({
    id: "tempel-1",
    name: "Tempel 1",
    kind: "comet",
    tagline: "The target of Deep Impact.",
    description:
      "Tempel 1 is a Jupiter-family comet examined by both Deep Impact and Stardust-NExT.",
    meanRadiusKm: 3,
    color: "#b7b09c",
    sourceUrl: NASA_SMALL_BODIES,
    elements: elements({
      semiMajorAxis: 3.19255,
      eccentricity: 0.517,
      inclinationDeg: 10.47,
      longitudeAscendingNodeDeg: 68.93,
      argumentOfPeriapsisDeg: 178.84,
      meanAnomalyAtEpochDeg: 0,
      epochJulianDateTdb: 2_459_642.5,
    }),
    representation: representation({
      targetCode: "9P",
      epoch: {
        julianDate: 2_459_642.5,
        timeScale: "TDB",
        calendarLabel: "2022-03-04 TDB perihelion",
      },
      fallbackReason:
        "Frozen JPL-aligned comet snapshot; outgassing parameters are not propagated.",
    }),
  }),
]);

export const EXTENDED_BODY_BY_ID = Object.freeze(
  Object.fromEntries(EXTENDED_BODIES.map((item) => [item.id, item])) as Record<
    ExtendedBodyId,
    ExtendedBody
  >,
);

export function isExtendedBodyId(value: string): value is ExtendedBodyId {
  return value in EXTENDED_BODY_BY_ID;
}

const evaluatorCache = new WeakMap<ExtendedBody, EllipticOrbitEvaluator>();
function evaluatorFor(body: ExtendedBody): EllipticOrbitEvaluator {
  const cached = evaluatorCache.get(body);
  if (cached) return cached;
  const evaluator = new EllipticOrbitEvaluator(
    body.elements,
    referenceBasis("ecliptic-j2000"),
  );
  evaluatorCache.set(body, evaluator);
  return evaluator;
}

function scalePhysicalAuToScene(
  physical: readonly [number, number, number],
  mode: ScaleMode,
  target: [number, number, number],
): [number, number, number] {
  const distanceAu = Math.hypot(physical[0], physical[1], physical[2]);
  const strategy = mode === "scientific" ? scientificScale : explorationScale;
  const factor =
    distanceAu === 0 ? 0 : strategy.distanceFromAu(distanceAu) / distanceAu;
  target[0] = physical[0] * factor;
  target[1] = physical[1] * factor;
  target[2] = physical[2] * factor;
  return target;
}

export function extendedBodyPhysicalPositionAu(
  body: ExtendedBody,
  timestampMs: number,
  target: [number, number, number] = [0, 0, 0],
): {
  readonly position: [number, number, number];
  readonly solver: KeplerSolution;
} {
  return evaluatorFor(body).positionAtUtcMsWithMetadata(timestampMs, target);
}

export function extendedBodyPosition(
  body: ExtendedBody,
  timestampMs: number,
  mode: ScaleMode,
  target: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  const physical = evaluatorFor(body).positionAtUtcMs(timestampMs);
  return scalePhysicalAuToScene(physical, mode, target);
}

export function extendedBodyPositionWithMetadata(
  body: ExtendedBody,
  timestampMs: number,
  mode: ScaleMode,
  sceneTarget: [number, number, number] = [0, 0, 0],
  physicalTarget: [number, number, number] = [0, 0, 0],
): ExtendedBodyPositionResult {
  const evaluated = evaluatorFor(body).positionAtUtcMsWithMetadata(
    timestampMs,
    physicalTarget,
  );
  return {
    position: scalePhysicalAuToScene(evaluated.position, mode, sceneTarget),
    physicalAu: evaluated.position,
    solver: evaluated.solver,
  };
}

export function extendedBodyRadius(
  body: ExtendedBody,
  mode: ScaleMode,
): number {
  const scale = mode === "scientific" ? scientificScale : explorationScale;
  const exact = scale.radiusFromKm(body.meanRadiusKm);
  return mode === "scientific"
    ? exact
    : Math.max(body.kind === "comet" ? 0.1 : 0.17, exact);
}

export function extendedOrbitPoints(
  body: ExtendedBody,
  mode: ScaleMode,
  segments: number,
): readonly (readonly [number, number, number])[] {
  return evaluatorFor(body).samplePath(
    Math.max(8, segments),
    (source, target) => scalePhysicalAuToScene(source, mode, target),
  );
}

export function cometTailState(
  body: ExtendedBody,
  timestampMs: number,
  targetDirection: [number, number, number] = [0, 0, 0],
): CometTailState {
  if (body.kind !== "comet") {
    targetDirection[0] = 0;
    targetDirection[1] = 1;
    targetDirection[2] = 0;
    return {
      antiSolarDirection: targetDirection,
      heliocentricDistanceAu: Number.POSITIVE_INFINITY,
      activity: 0,
      lengthScale: 0,
      visible: false,
    };
  }
  const physical = evaluatorFor(body).positionAtUtcMs(timestampMs);
  const distance = Math.hypot(physical[0], physical[1], physical[2]);
  if (distance > 1e-12) {
    targetDirection[0] = physical[0] / distance;
    targetDirection[1] = physical[1] / distance;
    targetDirection[2] = physical[2] / distance;
  } else {
    targetDirection[0] = 1;
    targetDirection[1] = 0;
    targetDirection[2] = 0;
  }
  const fadeStartAu = 5.2;
  const fullyActiveAu = 1;
  const activity = Math.max(
    0,
    Math.min(1, (fadeStartAu - distance) / (fadeStartAu - fullyActiveAu)),
  );
  return {
    antiSolarDirection: targetDirection,
    heliocentricDistanceAu: distance,
    activity,
    lengthScale: 0.18 + Math.pow(activity, 0.8) * 0.82,
    visible: activity > 0.015,
  };
}
