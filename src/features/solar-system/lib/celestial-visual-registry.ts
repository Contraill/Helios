import officialRuntimeOverrides from "../../../../scripts/data/celestial-official-runtime-overrides.json";

import type {
  DwarfSatelliteId,
  ExtendedBodyId,
  MoonId,
} from "@/features/solar-system/types/celestial-body";

import { MOON_BY_ID } from "./moon-catalogue";

import type { VisualRotationProfile } from "./visual-rotation-policy";

export type VisualBodyId = MoonId | ExtendedBodyId | DwarfSatelliteId;
export type VisualCategory =
  | "featured-moon"
  | "asteroid"
  | "dwarf-kuiper"
  | "comet"
  | "dwarf-system-satellite";
export type VisualAssetRepresentation =
  "real-map" | "derived-map" | "procedural-reconstruction";
export type VisualGeometryKind =
  "sphere" | "ellipsoid" | "irregular" | "bilobed";
export type VisualSurfaceCoverage =
  | "global-map"
  | "partial-imagery-filled"
  | "procedural-reference";


interface OfficialRuntimeAssetOverride {
  readonly bodyId: VisualBodyId;
  readonly assetPath: string;
  readonly representation: Exclude<
    VisualAssetRepresentation,
    "procedural-reconstruction"
  >;
  readonly projection: "equirectangular";
  readonly northPoleConvention: string;
  readonly flipY: boolean;
  readonly flipX: boolean;
  readonly textureLongitudeOffsetDeg: number;
  readonly primeMeridianVerified: boolean;
  readonly orientationSourceId: string;
  readonly visualCalibrationNote: string;
  readonly sourceId: string;
  readonly coverage: Exclude<VisualSurfaceCoverage, "procedural-reference">;
  readonly surfaceNote: string;
}

const OFFICIAL_RUNTIME_OVERRIDE_BY_ID = new Map<
  VisualBodyId,
  OfficialRuntimeAssetOverride
>(
  (officialRuntimeOverrides.assets as OfficialRuntimeAssetOverride[]).map(
    (asset) => [asset.bodyId, asset],
  ),
);

export interface VisualOrientationMetadata {
  readonly projection: "equirectangular" | "procedural-equirectangular";
  readonly northPoleConvention: string;
  readonly flipY: boolean;
  readonly flipX: boolean;
  readonly textureLongitudeOffsetDeg: number;
  readonly rotationSense:
    "prograde" | "retrograde" | "tidally-locked" | "unknown";
  readonly primeMeridianVerified: boolean;
  readonly orientationSourceId: string;
  readonly visualCalibrationNote: string;
}

export interface AtmosphereProfile {
  readonly color: string;
  readonly scale: number;
  readonly opacity: number;
}

export interface RingProfile {
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly opacity: number;
  readonly color: string;
}

export interface CometVisualProfile {
  readonly dustColor: string;
  readonly ionColor: string;
  readonly comaColor: string;
  readonly dustLength: number;
  readonly ionLength: number;
  readonly dustWidth: number;
  readonly ionWidth: number;
}

export interface CelestialVisualProfile {
  readonly id: VisualBodyId;
  readonly category: VisualCategory;
  readonly geometry: {
    readonly kind: VisualGeometryKind;
    readonly scale: readonly [number, number, number];
    readonly seed: number;
  };
  readonly surface: {
    readonly assetPath: string;
    readonly representation: VisualAssetRepresentation;
    readonly coverage: VisualSurfaceCoverage;
    readonly note: string;
    readonly fallbackColor: string;
    readonly roughness: number;
    readonly emissiveIntensity: number;
  };
  readonly orientation: VisualOrientationMetadata;
  readonly atmosphere?: AtmosphereProfile;
  readonly ring?: RingProfile;
  readonly comet?: CometVisualProfile;
  readonly rotation: VisualRotationProfile;
  readonly loadingPriority: number;
  readonly sourceId: string;
}

interface VisualDefinition {
  readonly id: VisualBodyId;
  readonly category: VisualCategory;
  readonly kind?: VisualGeometryKind;
  readonly scale?: readonly [number, number, number];
  readonly seed: number;
  readonly fallbackColor: string;
  readonly roughness?: number;
  readonly loadingPriority?: number;
  readonly atmosphere?: AtmosphereProfile;
  readonly ring?: RingProfile;
  readonly comet?: CometVisualProfile;
}

const J2000_MS = Date.UTC(2000, 0, 1, 12);

function rotationFor(
  id: VisualBodyId,
  category: VisualCategory,
): VisualRotationProfile {
  if (category === "featured-moon") {
    const moonRotation = MOON_BY_ID[id as MoonId].rotation;
    if (moonRotation.kind === "tidally-locked") {
      return {
        kind: "tidally-locked",
        sourceId: moonRotation.orientationSourceId,
      };
    }
    return {
      kind: "fixed-unknown",
      sourceId: moonRotation.orientationSourceId,
      note: "The featured-moon catalogue does not assert a source-backed rotation or tidal-lock state; the visual orientation remains fixed.",
    };
  }
  if (id === "dwarf-satellite-charon") {
    return { kind: "tidally-locked", sourceId: "nasa-pluto-charon-facts" };
  }
  const periodic: Partial<
    Record<
      VisualBodyId,
      Omit<Extract<VisualRotationProfile, { kind: "periodic" }>, "kind">
    >
  > = {
    ceres: {
      periodHours: 9,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "nasa-ceres-facts",
    },
    vesta: {
      periodHours: 5.34,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "nasa-dawn-vesta-rotation",
    },
    pluto: {
      periodHours: 153,
      retrograde: true,
      epochMs: J2000_MS,
      sourceId: "nasa-pluto-facts",
    },
    haumea: {
      periodHours: 4,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "nasa-haumea-facts",
    },
    halley: {
      periodHours: 52.8,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "nasa-halley-facts",
    },
    "67p": {
      periodHours: 12.4,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "esa-rosetta-67p-rotation",
    },
    "tempel-1": {
      periodHours: 41,
      retrograde: false,
      epochMs: J2000_MS,
      sourceId: "nasa-deep-impact-tempel-1-rotation",
    },
  };
  const source = periodic[id];
  if (source) return { kind: "periodic", ...source };
  return {
    kind: "fixed-unknown",
    sourceId: `helios-rotation-unknown-${id}`,
    note: "No source-backed rotation period is asserted by the accepted visual catalogue; orientation remains fixed.",
  };
}

function profile(definition: VisualDefinition): CelestialVisualProfile {
  const runtimeOverride = OFFICIAL_RUNTIME_OVERRIDE_BY_ID.get(definition.id);
  const sourceId = runtimeOverride?.sourceId ?? `helios-visual-${definition.id}`;
  const rotation = rotationFor(definition.id, definition.category);
  const representation: VisualAssetRepresentation =
    runtimeOverride?.representation ?? "procedural-reconstruction";
  const coverage: VisualSurfaceCoverage =
    runtimeOverride?.coverage ?? "procedural-reference";
  const projection: VisualOrientationMetadata["projection"] =
    runtimeOverride?.projection ?? "procedural-equirectangular";
  const rotationSense: VisualOrientationMetadata["rotationSense"] =
    rotation.kind === "tidally-locked"
      ? "tidally-locked"
      : rotation.kind === "periodic"
        ? rotation.retrograde
          ? "retrograde"
          : "prograde"
        : "unknown";
  return Object.freeze({
    id: definition.id,
    category: definition.category,
    geometry: {
      kind: definition.kind ?? "sphere",
      scale: definition.scale ?? [1, 1, 1],
      seed: definition.seed,
    },
    surface: {
      assetPath:
        runtimeOverride?.assetPath ??
        `/textures/celestial/${definition.id}.webp`,
      representation,
      coverage,
      note:
        runtimeOverride?.surfaceNote ??
        "Deterministic visual reconstruction based on cited mission references; not a reproduced source raster.",
      fallbackColor: definition.fallbackColor,
      roughness: definition.roughness ?? 0.9,
      emissiveIntensity: 0,
    },
    orientation: {
      projection,
      northPoleConvention:
        runtimeOverride?.northPoleConvention ??
        "visual-north-up; not navigation-grade",
      flipY: runtimeOverride?.flipY ?? false,
      flipX: runtimeOverride?.flipX ?? false,
      textureLongitudeOffsetDeg:
        runtimeOverride?.textureLongitudeOffsetDeg ?? 0,
      rotationSense,
      primeMeridianVerified:
        runtimeOverride?.primeMeridianVerified ?? false,
      orientationSourceId:
        runtimeOverride?.orientationSourceId ?? sourceId,
      visualCalibrationNote:
        runtimeOverride?.visualCalibrationNote ??
        "Visual identity only; no navigation-grade longitude is claimed.",
    },
    ...(definition.atmosphere ? { atmosphere: definition.atmosphere } : {}),
    ...(definition.ring ? { ring: definition.ring } : {}),
    ...(definition.comet ? { comet: definition.comet } : {}),
    rotation,
    loadingPriority: definition.loadingPriority ?? 75,
    sourceId,
  });
}

const definitions: readonly VisualDefinition[] = [
  {
    id: "moon-earth-moon",
    category: "featured-moon",
    seed: 3545481695,
    fallbackColor: "#76746e",
    loadingPriority: 95,
  },
  {
    id: "moon-mars-phobos",
    category: "featured-moon",
    kind: "irregular",
    scale: [1.22, 0.88, 0.78],
    seed: 1600773181,
    fallbackColor: "#4f463f",
  },
  {
    id: "moon-mars-deimos",
    category: "featured-moon",
    kind: "irregular",
    scale: [1.18, 0.92, 0.84],
    seed: 1774152387,
    fallbackColor: "#635b53",
  },
  {
    id: "moon-jupiter-io",
    category: "featured-moon",
    seed: 3088019547,
    fallbackColor: "#dbb746",
  },
  {
    id: "moon-jupiter-europa",
    category: "featured-moon",
    seed: 652094999,
    fallbackColor: "#bfb292",
    loadingPriority: 95,
  },
  {
    id: "moon-jupiter-ganymede",
    category: "featured-moon",
    seed: 474163641,
    fallbackColor: "#6f675c",
  },
  {
    id: "moon-jupiter-callisto",
    category: "featured-moon",
    seed: 4087488459,
    fallbackColor: "#3f3a35",
  },
  {
    id: "moon-saturn-mimas",
    category: "featured-moon",
    seed: 1208960001,
    fallbackColor: "#979792",
  },
  {
    id: "moon-saturn-enceladus",
    category: "featured-moon",
    seed: 4275550027,
    fallbackColor: "#dde1de",
  },
  {
    id: "moon-saturn-tethys",
    category: "featured-moon",
    seed: 263025473,
    fallbackColor: "#b6b3a9",
  },
  {
    id: "moon-saturn-dione",
    category: "featured-moon",
    seed: 4035417092,
    fallbackColor: "#a9aaa6",
  },
  {
    id: "moon-saturn-rhea",
    category: "featured-moon",
    seed: 3402913859,
    fallbackColor: "#9b9a96",
  },
  {
    id: "moon-saturn-titan",
    category: "featured-moon",
    seed: 2990612276,
    fallbackColor: "#b26b25",
    loadingPriority: 95,
    atmosphere: {
      color: "#d88b31",
      scale: 0.16,
      opacity: 0.22,
    },
  },
  {
    id: "moon-saturn-iapetus",
    category: "featured-moon",
    seed: 2510398786,
    fallbackColor: "#aba596",
  },
  {
    id: "moon-uranus-miranda",
    category: "featured-moon",
    seed: 1543903940,
    fallbackColor: "#959591",
  },
  {
    id: "moon-uranus-ariel",
    category: "featured-moon",
    seed: 3199280130,
    fallbackColor: "#acb1b1",
  },
  {
    id: "moon-uranus-umbriel",
    category: "featured-moon",
    seed: 432991847,
    fallbackColor: "#4f504f",
  },
  {
    id: "moon-uranus-titania",
    category: "featured-moon",
    seed: 1902933456,
    fallbackColor: "#8e918e",
  },
  {
    id: "moon-uranus-oberon",
    category: "featured-moon",
    seed: 4237380642,
    fallbackColor: "#696560",
  },
  {
    id: "moon-neptune-proteus",
    category: "featured-moon",
    kind: "irregular",
    scale: [1.13, 0.94, 0.86],
    seed: 411447402,
    fallbackColor: "#4e4b48",
  },
  {
    id: "moon-neptune-triton",
    category: "featured-moon",
    seed: 1912152372,
    fallbackColor: "#b9b2a7",
  },
  {
    id: "moon-neptune-nereid",
    category: "featured-moon",
    kind: "irregular",
    scale: [1.08, 0.96, 0.91],
    seed: 4114520144,
    fallbackColor: "#5f6365",
  },

  {
    id: "ceres",
    category: "asteroid",
    seed: 2648457229,
    fallbackColor: "#6a6760",
    roughness: 0.96,
    loadingPriority: 60,
  },
  {
    id: "vesta",
    category: "asteroid",
    kind: "irregular",
    scale: [1.08, 0.91, 0.8],
    seed: 2046382309,
    fallbackColor: "#847463",
    roughness: 0.96,
    loadingPriority: 60,
  },
  {
    id: "pallas",
    category: "asteroid",
    kind: "irregular",
    scale: [1.08, 0.94, 0.89],
    seed: 91480592,
    fallbackColor: "#5c5854",
    roughness: 0.96,
    loadingPriority: 60,
  },
  {
    id: "hygiea",
    category: "asteroid",
    kind: "ellipsoid",
    scale: [1.03, 0.98, 0.96],
    seed: 915202374,
    fallbackColor: "#2f302f",
    roughness: 0.96,
    loadingPriority: 60,
  },

  {
    id: "pluto",
    category: "dwarf-kuiper",
    seed: 3297463797,
    fallbackColor: "#ae8e77",
    loadingPriority: 95,
    atmosphere: {
      color: "#a9c8dc",
      scale: 0.035,
      opacity: 0.08,
    },
  },
  {
    id: "eris",
    category: "dwarf-kuiper",
    seed: 2719951012,
    fallbackColor: "#c0bfb8",
    loadingPriority: 60,
  },
  {
    id: "haumea",
    category: "dwarf-kuiper",
    kind: "ellipsoid",
    scale: [1.95, 1, 0.82],
    seed: 3267792838,
    fallbackColor: "#b9b9b1",
    loadingPriority: 95,
    ring: {
      innerRadius: 1.55,
      outerRadius: 2.12,
      opacity: 0.17,
      color: "#d8d4c9",
    },
  },
  {
    id: "makemake",
    category: "dwarf-kuiper",
    seed: 2264117871,
    fallbackColor: "#93694e",
    loadingPriority: 60,
  },
  {
    id: "quaoar",
    category: "dwarf-kuiper",
    seed: 3642080751,
    fallbackColor: "#865c4c",
    loadingPriority: 60,
    ring: {
      innerRadius: 2.15,
      outerRadius: 2.42,
      opacity: 0.07,
      color: "#c9b6a4",
    },
  },
  {
    id: "gonggong",
    category: "dwarf-kuiper",
    seed: 3430050324,
    fallbackColor: "#8e4637",
    loadingPriority: 60,
  },
  {
    id: "sedna",
    category: "dwarf-kuiper",
    seed: 946863481,
    fallbackColor: "#77362d",
    loadingPriority: 60,
  },
  {
    id: "orcus",
    category: "dwarf-kuiper",
    seed: 314263880,
    fallbackColor: "#77766f",
    loadingPriority: 60,
  },

  {
    id: "halley",
    category: "comet",
    kind: "irregular",
    scale: [1.33, 0.74, 0.67],
    seed: 3904729172,
    fallbackColor: "#23211e",
    roughness: 0.96,
    loadingPriority: 60,
    comet: {
      dustColor: "#d9bf8f",
      ionColor: "#70c8ff",
      comaColor: "#def3e4",
      dustLength: 8,
      ionLength: 10.5,
      dustWidth: 0.28,
      ionWidth: 0.34,
    },
  },
  {
    id: "hale-bopp",
    category: "comet",
    kind: "irregular",
    scale: [1.18, 0.86, 0.75],
    seed: 4289632555,
    fallbackColor: "#33302b",
    roughness: 0.96,
    loadingPriority: 60,
    comet: {
      dustColor: "#e2c796",
      ionColor: "#76bfff",
      comaColor: "#e9f2de",
      dustLength: 11.5,
      ionLength: 14,
      dustWidth: 0.42,
      ionWidth: 0.36,
    },
  },
  {
    id: "encke",
    category: "comet",
    kind: "irregular",
    scale: [1.2, 0.82, 0.7],
    seed: 590490377,
    fallbackColor: "#2b2825",
    roughness: 0.96,
    loadingPriority: 60,
    comet: {
      dustColor: "#c5a87b",
      ionColor: "#5eaee8",
      comaColor: "#d9e6d6",
      dustLength: 5,
      ionLength: 6.8,
      dustWidth: 0.23,
      ionWidth: 0.2,
    },
  },
  {
    id: "67p",
    category: "comet",
    kind: "bilobed",
    scale: [1.18, 0.82, 0.8],
    seed: 3303637966,
    fallbackColor: "#242321",
    roughness: 0.96,
    loadingPriority: 95,
    comet: {
      dustColor: "#c7ae82",
      ionColor: "#70bcec",
      comaColor: "#d7e6d9",
      dustLength: 6.8,
      ionLength: 8.5,
      dustWidth: 0.31,
      ionWidth: 0.24,
    },
  },
  {
    id: "neowise",
    category: "comet",
    kind: "irregular",
    scale: [1.16, 0.84, 0.76],
    seed: 1951384519,
    fallbackColor: "#302b25",
    roughness: 0.96,
    loadingPriority: 60,
    comet: {
      dustColor: "#e0bb82",
      ionColor: "#67b8f5",
      comaColor: "#e0efe0",
      dustLength: 9.5,
      ionLength: 12,
      dustWidth: 0.37,
      ionWidth: 0.32,
    },
  },
  {
    id: "tempel-1",
    category: "comet",
    kind: "irregular",
    scale: [1.17, 0.9, 0.72],
    seed: 2492130493,
    fallbackColor: "#2d2b28",
    roughness: 0.96,
    loadingPriority: 60,
    comet: {
      dustColor: "#c8ab80",
      ionColor: "#62a9dc",
      comaColor: "#d8e5d3",
      dustLength: 5.8,
      ionLength: 7.4,
      dustWidth: 0.26,
      ionWidth: 0.22,
    },
  },

  {
    id: "dwarf-satellite-charon",
    category: "dwarf-system-satellite",
    seed: 1781617422,
    fallbackColor: "#817e7a",
  },
  {
    id: "dwarf-satellite-dysnomia",
    category: "dwarf-system-satellite",
    seed: 856725129,
    fallbackColor: "#53514e",
  },
  {
    id: "dwarf-satellite-hiiaka",
    category: "dwarf-system-satellite",
    seed: 2328644841,
    fallbackColor: "#adaea8",
  },
  {
    id: "dwarf-satellite-namaka",
    category: "dwarf-system-satellite",
    seed: 3797864837,
    fallbackColor: "#979791",
  },
  {
    id: "dwarf-satellite-mk2",
    category: "dwarf-system-satellite",
    seed: 2517591442,
    fallbackColor: "#3d3935",
  },
  {
    id: "dwarf-satellite-weywot",
    category: "dwarf-system-satellite",
    seed: 3998960329,
    fallbackColor: "#4d423c",
  },
  {
    id: "dwarf-satellite-xiangliu",
    category: "dwarf-system-satellite",
    seed: 2979271277,
    fallbackColor: "#423a37",
  },
  {
    id: "dwarf-satellite-vanth",
    category: "dwarf-system-satellite",
    seed: 1141470863,
    fallbackColor: "#706a62",
  },
] as const;

export const CELESTIAL_VISUAL_REGISTRY: Readonly<
  Record<VisualBodyId, CelestialVisualProfile>
> = Object.freeze(
  Object.fromEntries(
    definitions.map((definition) => [definition.id, profile(definition)]),
  ) as Record<VisualBodyId, CelestialVisualProfile>,
);

export const visualProfileFor = (id: VisualBodyId): CelestialVisualProfile =>
  CELESTIAL_VISUAL_REGISTRY[id];

export const visualRegistryIds = Object.freeze(
  Object.keys(CELESTIAL_VISUAL_REGISTRY) as VisualBodyId[],
);
