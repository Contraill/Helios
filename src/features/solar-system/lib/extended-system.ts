import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";

export type ExtendedBodyId =
  | "ceres"
  | "vesta"
  | "pallas"
  | "hygiea"
  | "pluto"
  | "eris"
  | "haumea"
  | "makemake"
  | "quaoar"
  | "gonggong"
  | "sedna"
  | "orcus"
  | "halley"
  | "hale-bopp"
  | "encke"
  | "67p"
  | "neowise"
  | "tempel-1";

export type SystemRegionId =
  "asteroid-belt" | "kuiper-belt" | "oort-cloud" | "heliosphere";

export type ExtendedBodyKind =
  "dwarf-planet" | "asteroid" | "kuiper-object" | "comet";

export interface ExtendedBody {
  readonly id: ExtendedBodyId;
  readonly name: string;
  readonly kind: ExtendedBodyKind;
  readonly tagline: string;
  readonly description: string;
  readonly semiMajorAxisAu: number;
  readonly eccentricity: number;
  readonly inclinationDeg: number;
  readonly meanRadiusKm: number;
  readonly color: string;
  readonly meanAnomalyDeg: number;
  readonly perihelionUtc?: string;
  readonly sourceUrl: string;
}

const NASA_SMALL_BODIES = "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html";

export const EXTENDED_BODIES: readonly ExtendedBody[] = Object.freeze([
  {
    id: "ceres",
    name: "Ceres",
    kind: "dwarf-planet",
    tagline: "The largest world in the asteroid belt.",
    description:
      "Ceres is a differentiated dwarf planet and the only dwarf planet in the inner Solar System.",
    semiMajorAxisAu: 2.768,
    eccentricity: 0.076,
    inclinationDeg: 10.59,
    meanRadiusKm: 469.7,
    color: "#a89b8a",
    meanAnomalyDeg: 77,
    sourceUrl: "https://science.nasa.gov/dwarf-planets/ceres/",
  },
  {
    id: "vesta",
    name: "Vesta",
    kind: "asteroid",
    tagline: "A battered protoplanet with a giant south-polar basin.",
    description:
      "Vesta is the second-largest body in the main belt by mass and was visited by Dawn.",
    semiMajorAxisAu: 2.362,
    eccentricity: 0.089,
    inclinationDeg: 7.14,
    meanRadiusKm: 262.7,
    color: "#b8afa2",
    meanAnomalyDeg: 151,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "pallas",
    name: "Pallas",
    kind: "asteroid",
    tagline: "A highly inclined main-belt world.",
    description:
      "Pallas follows a noticeably tilted and eccentric orbit through the asteroid belt.",
    semiMajorAxisAu: 2.773,
    eccentricity: 0.23,
    inclinationDeg: 34.84,
    meanRadiusKm: 256,
    color: "#8d928f",
    meanAnomalyDeg: 31,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "hygiea",
    name: "Hygiea",
    kind: "asteroid",
    tagline: "A dark, nearly spherical outer-belt body.",
    description:
      "Hygiea is the largest member of a carbon-rich asteroid family in the outer main belt.",
    semiMajorAxisAu: 3.141,
    eccentricity: 0.112,
    inclinationDeg: 3.83,
    meanRadiusKm: 216.5,
    color: "#686963",
    meanAnomalyDeg: 248,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "pluto",
    name: "Pluto",
    kind: "dwarf-planet",
    tagline: "A complex, active world at the Kuiper belt's inner frontier.",
    description:
      "Pluto has mountains, glaciers, haze layers and a resonant orbit beyond Neptune.",
    semiMajorAxisAu: 39.482,
    eccentricity: 0.249,
    inclinationDeg: 17.16,
    meanRadiusKm: 1188.3,
    color: "#d2b89d",
    meanAnomalyDeg: 15,
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/",
  },
  {
    id: "eris",
    name: "Eris",
    kind: "dwarf-planet",
    tagline: "A massive dwarf planet on a distant tilted orbit.",
    description:
      "Eris helped trigger the modern definition of a planet and spends most of its orbit far beyond Pluto.",
    semiMajorAxisAu: 67.78,
    eccentricity: 0.44,
    inclinationDeg: 44.04,
    meanRadiusKm: 1163,
    color: "#d8d9d5",
    meanAnomalyDeg: 205,
    sourceUrl: "https://science.nasa.gov/dwarf-planets/eris/",
  },
  {
    id: "haumea",
    name: "Haumea",
    kind: "dwarf-planet",
    tagline: "A rapidly rotating, elongated dwarf planet.",
    description:
      "Haumea's fast spin produces an unusual elongated shape; it also has a ring and moons.",
    semiMajorAxisAu: 43.218,
    eccentricity: 0.191,
    inclinationDeg: 28.19,
    meanRadiusKm: 780,
    color: "#cdd8dc",
    meanAnomalyDeg: 219,
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/",
  },
  {
    id: "makemake",
    name: "Makemake",
    kind: "dwarf-planet",
    tagline: "A bright methane-rich Kuiper belt world.",
    description:
      "Makemake is one of the largest known objects in the classical Kuiper belt.",
    semiMajorAxisAu: 45.43,
    eccentricity: 0.159,
    inclinationDeg: 28.98,
    meanRadiusKm: 715,
    color: "#c77b58",
    meanAnomalyDeg: 165,
    sourceUrl: "https://science.nasa.gov/dwarf-planets/makemake/",
  },
  {
    id: "quaoar",
    name: "Quaoar",
    kind: "kuiper-object",
    tagline: "A large classical Kuiper belt object with a distant ring.",
    description:
      "Quaoar is a rounded trans-Neptunian world with a moon and an unexpectedly distant ring.",
    semiMajorAxisAu: 43.69,
    eccentricity: 0.039,
    inclinationDeg: 7.99,
    meanRadiusKm: 555,
    color: "#aa8068",
    meanAnomalyDeg: 112,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "gonggong",
    name: "Gonggong",
    kind: "kuiper-object",
    tagline: "A reddish scattered-disk world on an eccentric orbit.",
    description:
      "Gonggong is a large trans-Neptunian object with water-ice signatures and a small moon.",
    semiMajorAxisAu: 67.5,
    eccentricity: 0.5,
    inclinationDeg: 30.7,
    meanRadiusKm: 615,
    color: "#9e5141",
    meanAnomalyDeg: 96,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "sedna",
    name: "Sedna",
    kind: "kuiper-object",
    tagline:
      "An extreme detached object from the Solar System's remote frontier.",
    description:
      "Sedna's enormous, eccentric orbit may preserve evidence of the early Solar System's environment.",
    semiMajorAxisAu: 506.8,
    eccentricity: 0.855,
    inclinationDeg: 11.93,
    meanRadiusKm: 500,
    color: "#9a4d42",
    meanAnomalyDeg: 358,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "orcus",
    name: "Orcus",
    kind: "kuiper-object",
    tagline: "A resonant companion to Pluto's orbital family.",
    description:
      "Orcus occupies a 2:3 resonance with Neptune and has a large moon, Vanth.",
    semiMajorAxisAu: 39.17,
    eccentricity: 0.227,
    inclinationDeg: 20.59,
    meanRadiusKm: 455,
    color: "#96999d",
    meanAnomalyDeg: 181,
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "halley",
    name: "Halley",
    kind: "comet",
    tagline: "The best-known returning comet.",
    description:
      "Halley's retrograde orbit brings it through the inner Solar System roughly every 76 years.",
    semiMajorAxisAu: 17.834,
    eccentricity: 0.967,
    inclinationDeg: 162.26,
    meanRadiusKm: 5.5,
    color: "#d8e9e8",
    meanAnomalyDeg: 0,
    perihelionUtc: "2061-07-28T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "hale-bopp",
    name: "Hale–Bopp",
    kind: "comet",
    tagline: "A great long-period comet with a vast orbital path.",
    description:
      "Hale–Bopp's 1997 apparition displayed prominent, physically distinct dust and ion tails.",
    semiMajorAxisAu: 186,
    eccentricity: 0.995,
    inclinationDeg: 89.4,
    meanRadiusKm: 30,
    color: "#d8f0ff",
    meanAnomalyDeg: 0,
    perihelionUtc: "1997-04-01T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "encke",
    name: "Encke",
    kind: "comet",
    tagline: "A short-period comet returning every 3.3 years.",
    description:
      "Encke has one of the shortest known comet periods and feeds the Taurid meteoroid complex.",
    semiMajorAxisAu: 2.215,
    eccentricity: 0.848,
    inclinationDeg: 11.8,
    meanRadiusKm: 2.4,
    color: "#cde5d4",
    meanAnomalyDeg: 0,
    perihelionUtc: "2027-02-10T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "67p",
    name: "67P/Churyumov–Gerasimenko",
    kind: "comet",
    tagline: "Rosetta's bilobed comet.",
    description:
      "67P was orbited and landed on by ESA's Rosetta mission, revealing a porous, active nucleus.",
    semiMajorAxisAu: 3.463,
    eccentricity: 0.641,
    inclinationDeg: 7.04,
    meanRadiusKm: 2,
    color: "#bec6bb",
    meanAnomalyDeg: 0,
    perihelionUtc: "2028-04-09T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "neowise",
    name: "NEOWISE",
    kind: "comet",
    tagline: "The bright northern-sky comet of 2020.",
    description:
      "C/2020 F3 NEOWISE is a long-period comet whose dust and ion tails were widely observed.",
    semiMajorAxisAu: 358,
    eccentricity: 0.9992,
    inclinationDeg: 128.9,
    meanRadiusKm: 2.5,
    color: "#e4d7b8",
    meanAnomalyDeg: 0,
    perihelionUtc: "2020-07-03T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
  {
    id: "tempel-1",
    name: "Tempel 1",
    kind: "comet",
    tagline: "The target of Deep Impact.",
    description:
      "Tempel 1 is a Jupiter-family comet examined by both Deep Impact and Stardust-NExT.",
    semiMajorAxisAu: 3.14,
    eccentricity: 0.517,
    inclinationDeg: 10.47,
    meanRadiusKm: 3,
    color: "#b7b09c",
    meanAnomalyDeg: 0,
    perihelionUtc: "2028-05-16T00:00:00.000Z",
    sourceUrl: NASA_SMALL_BODIES,
  },
]);

export const EXTENDED_BODY_BY_ID = Object.freeze(
  Object.fromEntries(EXTENDED_BODIES.map((body) => [body.id, body])) as Record<
    ExtendedBodyId,
    ExtendedBody
  >,
);

export function isExtendedBodyId(value: string): value is ExtendedBodyId {
  return value in EXTENDED_BODY_BY_ID;
}

const J2000_MS = Date.parse("2000-01-01T12:00:00.000Z");
const DAY_MS = 86_400_000;

function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number) {
  let eccentricAnomaly = meanAnomaly;
  for (let iteration = 0; iteration < 8; iteration += 1) {
    eccentricAnomaly -=
      (eccentricAnomaly -
        eccentricity * Math.sin(eccentricAnomaly) -
        meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
  }
  return eccentricAnomaly;
}

export function extendedBodyPosition(
  body: ExtendedBody,
  timestampMs: number,
  mode: ScaleMode,
): readonly [number, number, number] {
  const orbitalPeriodDays = 365.256 * Math.pow(body.semiMajorAxisAu, 1.5);
  const epochMs = body.perihelionUtc
    ? Date.parse(body.perihelionUtc)
    : J2000_MS;
  const baseMeanAnomaly = body.perihelionUtc
    ? 0
    : (body.meanAnomalyDeg * Math.PI) / 180;
  const meanAnomaly =
    baseMeanAnomaly +
    ((timestampMs - epochMs) / DAY_MS / orbitalPeriodDays) * Math.PI * 2;
  const eccentricAnomaly = solveEccentricAnomaly(
    meanAnomaly,
    body.eccentricity,
  );
  const xAu =
    body.semiMajorAxisAu * (Math.cos(eccentricAnomaly) - body.eccentricity);
  const zAu =
    body.semiMajorAxisAu *
    Math.sqrt(1 - body.eccentricity ** 2) *
    Math.sin(eccentricAnomaly);
  const distanceAu = Math.hypot(xAu, zAu);
  const scale = mode === "scientific" ? scientificScale : explorationScale;
  const sceneDistance = scale.distanceFromAu(distanceAu);
  const factor = distanceAu === 0 ? 0 : sceneDistance / distanceAu;
  const inclination = (body.inclinationDeg * Math.PI) / 180;
  const rotatedZ = zAu * Math.cos(inclination);
  const y = zAu * Math.sin(inclination);
  return [xAu * factor, y * factor, rotatedZ * factor];
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
): readonly [number, number, number][] {
  const scale = mode === "scientific" ? scientificScale : explorationScale;
  const inclination = (body.inclinationDeg * Math.PI) / 180;
  return Array.from({ length: segments + 1 }, (_, index) => {
    const eccentricAnomaly = (index / segments) * Math.PI * 2;
    const xAu =
      body.semiMajorAxisAu * (Math.cos(eccentricAnomaly) - body.eccentricity);
    const zAu =
      body.semiMajorAxisAu *
      Math.sqrt(1 - body.eccentricity ** 2) *
      Math.sin(eccentricAnomaly);
    const distanceAu = Math.hypot(xAu, zAu);
    const factor =
      distanceAu === 0 ? 0 : scale.distanceFromAu(distanceAu) / distanceAu;
    return [
      xAu * factor,
      zAu * Math.sin(inclination) * factor,
      zAu * Math.cos(inclination) * factor,
    ];
  });
}
