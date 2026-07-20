import type { PlanetId } from "@/lib/data/schemas/planet";

export type TextureBodyId = "sun" | PlanetId;
export type RuntimeTextureKind =
  "primary-surface" | "primary-layer" | "ring-albedo";
export type TextureRepresentation =
  | "enhanced-color-mosaic"
  | "radar-composite"
  | "imaging-composite"
  | "topographic-composite"
  | "simulation";

export interface RuntimeTextureAsset {
  readonly decodedBytes: number;
  readonly height: number;
  readonly kind: RuntimeTextureKind;
  readonly owner: string;
  readonly path: string;
  readonly stage: "blocking-primary" | "background-secondary";
  readonly width: number;
}

export interface PlanetTextureSource {
  readonly asset: RuntimeTextureAsset;
  readonly attribution: string;
  readonly bodyId: TextureBodyId;
  readonly colorSpace: "srgb";
  readonly license: string;
  readonly materialSlot: "map";
  readonly provider: string;
  readonly representation: TextureRepresentation;
  readonly sourceId: string;
  readonly sourceMasterNote: string;
  readonly sourceUrl: string;
}

const asset = (
  path: string,
  owner: string,
  kind: RuntimeTextureKind,
  width: number,
  height: number,
): RuntimeTextureAsset =>
  Object.freeze({
    decodedBytes: width * height * 4,
    height,
    kind,
    owner,
    path,
    stage: "blocking-primary" as const,
    width,
  });

const NASA_MEDIA_LICENSE =
  "NASA media usage guidelines; NASA imagery generally is not copyrighted in the United States. NASA identifiers and third-party material remain protected.";
const SOLAR_SYSTEM_SCOPE_LICENSE =
  "Creative Commons Attribution 4.0 International (CC BY 4.0). Helios resizes and converts the source assets to WebP.";
const SOLAR_SYSTEM_SCOPE_URL = "https://www.solarsystemscope.com/textures/";
const SOLAR_SYSTEM_SCOPE_ATTRIBUTION =
  "Solar System Scope, based on NASA elevation and imagery data; colours are adjusted and unmapped gaps may contain corresponding fictional terrain";
const SOURCE_MASTER_NOTE =
  "The larger source master is attribution-only and is not shipped in public/ or the runtime bundle. The production derivative is capped at 2048×1024.";

function surfaceSource(
  bodyId: TextureBodyId,
  sourceId: string,
  representation: TextureRepresentation,
): PlanetTextureSource {
  return Object.freeze({
    asset: asset(
      `/textures/planets/${bodyId}.webp`,
      `celestial:${bodyId}:surface`,
      "primary-surface",
      2048,
      1024,
    ),
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    bodyId,
    colorSpace: "srgb",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    materialSlot: "map",
    provider: "Solar System Scope",
    representation,
    sourceId,
    sourceMasterNote: SOURCE_MASTER_NOTE,
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
  });
}

export const planetTextureSources: Readonly<
  Record<TextureBodyId, PlanetTextureSource>
> = Object.freeze({
  sun: surfaceSource("sun", "solar-system-scope-sun-8k", "simulation"),
  mercury: surfaceSource(
    "mercury",
    "solar-system-scope-mercury-8k",
    "enhanced-color-mosaic",
  ),
  venus: surfaceSource(
    "venus",
    "solar-system-scope-venus-surface-8k",
    "radar-composite",
  ),
  earth: surfaceSource(
    "earth",
    "solar-system-scope-earth-daymap-8k",
    "topographic-composite",
  ),
  mars: surfaceSource(
    "mars",
    "solar-system-scope-mars-8k",
    "imaging-composite",
  ),
  jupiter: surfaceSource(
    "jupiter",
    "solar-system-scope-jupiter-8k",
    "imaging-composite",
  ),
  saturn: surfaceSource("saturn", "solar-system-scope-saturn-8k", "simulation"),
  uranus: Object.freeze({
    asset: asset(
      "/textures/planets/uranus.webp",
      "celestial:uranus:surface",
      "primary-surface",
      2048,
      1024,
    ),
    bodyId: "uranus",
    sourceId: "nasa-voyager-pia01391",
    sourceUrl: "https://science.nasa.gov/photojournal/uranus/",
    provider: "NASA/JPL Voyager 2",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL Voyager 2; Helios procedural simulation",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    sourceMasterNote: SOURCE_MASTER_NOTE,
  }),
  neptune: Object.freeze({
    asset: asset(
      "/textures/planets/neptune.webp",
      "celestial:neptune:surface",
      "primary-surface",
      2048,
      1024,
    ),
    bodyId: "neptune",
    sourceId: "nasa-3d-neptune-simulation",
    sourceUrl: "https://science.nasa.gov/3d-resources/neptune/",
    provider: "NASA/JPL/Don Davis",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL/Don Davis; NASA 3D Resources; simulated map",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    sourceMasterNote: SOURCE_MASTER_NOTE,
  }),
});

export const earthCloudTextureSource: PlanetTextureSource = Object.freeze({
  asset: asset(
    "/textures/planets/earth-clouds.webp",
    "celestial:earth:clouds",
    "primary-layer",
    2048,
    1024,
  ),
  bodyId: "earth",
  sourceId: "solar-system-scope-earth-clouds-8k",
  sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
  provider: "Solar System Scope",
  license: SOLAR_SYSTEM_SCOPE_LICENSE,
  attribution: `${SOLAR_SYSTEM_SCOPE_ATTRIBUTION}; converted to a transparent cloud shell by Helios`,
  representation: "simulation",
  colorSpace: "srgb",
  materialSlot: "map",
  sourceMasterNote: SOURCE_MASTER_NOTE,
});

export const earthCityLightsTextureSource: PlanetTextureSource = Object.freeze({
  asset: asset(
    "/textures/planets/earth-city-lights.webp",
    "celestial:earth:city-lights",
    "primary-layer",
    2048,
    1024,
  ),
  bodyId: "earth",
  sourceId: "three-globe-earth-night-map",
  sourceUrl: "https://www.npmjs.com/package/three-globe?activeTab=code",
  provider: "three-globe example assets",
  license: "MIT License; resized and converted to WebP by Helios.",
  attribution:
    "three-globe Earth night example map; Helios isolates the warm light signal and applies a solar terminator in the shader",
  representation: "simulation",
  colorSpace: "srgb",
  materialSlot: "map",
  sourceMasterNote: SOURCE_MASTER_NOTE,
});

export const saturnRingTextureSource: RuntimeTextureAsset = asset(
  "/textures/rings/saturn.webp",
  "celestial:saturn:rings",
  "ring-albedo",
  2048,
  125,
);

export const blockingPrimaryTextureAssets: readonly RuntimeTextureAsset[] =
  Object.freeze([
    planetTextureSources.sun.asset,
    planetTextureSources.mercury.asset,
    planetTextureSources.venus.asset,
    planetTextureSources.earth.asset,
    planetTextureSources.mars.asset,
    planetTextureSources.jupiter.asset,
    planetTextureSources.saturn.asset,
    planetTextureSources.uranus.asset,
    planetTextureSources.neptune.asset,
    earthCloudTextureSource.asset,
    earthCityLightsTextureSource.asset,
    saturnRingTextureSource,
  ]);
