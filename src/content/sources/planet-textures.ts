import type { PlanetId } from "@/lib/data/schemas/planet";

export type TextureBodyId = "sun" | PlanetId;
export type TextureVariantName = "low" | "medium" | "high";
export type TextureRepresentation =
  | "enhanced-color-mosaic"
  | "radar-composite"
  | "imaging-composite"
  | "topographic-composite"
  | "simulation";

export interface PlanetTextureVariant {
  readonly decodedBytes: number;
  readonly height: number;
  readonly path: string;
  readonly width: number;
}

export interface PlanetTextureSource {
  readonly attribution: string;
  readonly bodyId: TextureBodyId;
  readonly colorSpace: "srgb";
  readonly license: string;
  readonly materialSlot: "map";
  readonly provider: string;
  readonly representation: TextureRepresentation;
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly variants: Readonly<Record<TextureVariantName, PlanetTextureVariant>>;
}

const variant = (
  body: TextureBodyId,
  name: TextureVariantName,
  width: number,
  height: number,
): PlanetTextureVariant =>
  Object.freeze({
    decodedBytes: width * height * 4,
    height,
    path: `/textures/planets/${body}-${name}.webp`,
    width,
  });

const variants = (
  body: TextureBodyId,
  highWidth: number,
  highHeight: number,
): PlanetTextureSource["variants"] =>
  Object.freeze({
    low: variant(body, "low", 256, 128),
    medium: variant(body, "medium", 512, 256),
    high: variant(body, "high", highWidth, highHeight),
  });

const NASA_MEDIA_LICENSE =
  "NASA media usage guidelines; NASA imagery generally is not copyrighted in the United States. NASA identifiers and third-party material remain protected.";
const SOLAR_SYSTEM_SCOPE_LICENSE =
  "Creative Commons Attribution 4.0 International (CC BY 4.0). Helios resizes and converts the source assets to WebP.";
const SOLAR_SYSTEM_SCOPE_URL = "https://www.solarsystemscope.com/textures/";
const SOLAR_SYSTEM_SCOPE_ATTRIBUTION =
  "Solar System Scope, based on NASA elevation and imagery data; colours are adjusted and unmapped gaps may contain corresponding fictional terrain";

export const planetTextureSources: Readonly<
  Record<TextureBodyId, PlanetTextureSource>
> = Object.freeze({
  sun: Object.freeze({
    bodyId: "sun",
    sourceId: "solar-system-scope-sun-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("sun", 4096, 2048),
  }),
  mercury: Object.freeze({
    bodyId: "mercury",
    sourceId: "solar-system-scope-mercury-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "enhanced-color-mosaic",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("mercury", 4096, 2048),
  }),
  venus: Object.freeze({
    bodyId: "venus",
    sourceId: "solar-system-scope-venus-surface-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "radar-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("venus", 4096, 2048),
  }),
  earth: Object.freeze({
    bodyId: "earth",
    sourceId: "solar-system-scope-earth-daymap-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "topographic-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("earth", 4096, 2048),
  }),
  mars: Object.freeze({
    bodyId: "mars",
    sourceId: "solar-system-scope-mars-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "imaging-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("mars", 4096, 2048),
  }),
  jupiter: Object.freeze({
    bodyId: "jupiter",
    sourceId: "solar-system-scope-jupiter-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "imaging-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("jupiter", 4096, 2048),
  }),
  saturn: Object.freeze({
    bodyId: "saturn",
    sourceId: "solar-system-scope-saturn-8k",
    sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
    provider: "Solar System Scope",
    license: SOLAR_SYSTEM_SCOPE_LICENSE,
    attribution: SOLAR_SYSTEM_SCOPE_ATTRIBUTION,
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("saturn", 4096, 2048),
  }),
  uranus: Object.freeze({
    bodyId: "uranus",
    sourceId: "nasa-voyager-pia01391",
    sourceUrl: "https://science.nasa.gov/photojournal/uranus/",
    provider: "NASA/JPL Voyager 2",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL Voyager 2; Helios procedural simulation",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("uranus", 2048, 1024),
  }),
  neptune: Object.freeze({
    bodyId: "neptune",
    sourceId: "nasa-3d-neptune-simulation",
    sourceUrl: "https://science.nasa.gov/3d-resources/neptune/",
    provider: "NASA/JPL/Don Davis",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL/Don Davis; NASA 3D Resources; simulated map",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("neptune", 2048, 1024),
  }),
});

export const earthCloudTextureSource: PlanetTextureSource = Object.freeze({
  bodyId: "earth",
  sourceId: "solar-system-scope-earth-clouds-8k",
  sourceUrl: SOLAR_SYSTEM_SCOPE_URL,
  provider: "Solar System Scope",
  license: SOLAR_SYSTEM_SCOPE_LICENSE,
  attribution: `${SOLAR_SYSTEM_SCOPE_ATTRIBUTION}; converted to a transparent cloud shell by Helios`,
  representation: "simulation",
  colorSpace: "srgb",
  materialSlot: "map",
  variants: Object.freeze({
    low: Object.freeze({
      decodedBytes: 128 * 64 * 4,
      height: 64,
      path: "/textures/planets/earth-clouds-low.webp",
      width: 128,
    }),
    medium: Object.freeze({
      decodedBytes: 512 * 256 * 4,
      height: 256,
      path: "/textures/planets/earth-clouds-medium.webp",
      width: 512,
    }),
    high: Object.freeze({
      decodedBytes: 2048 * 1024 * 4,
      height: 1024,
      path: "/textures/planets/earth-clouds-high.webp",
      width: 2048,
    }),
  }),
});

export const earthCityLightsTextureSource: PlanetTextureSource = Object.freeze({
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
  variants: Object.freeze({
    low: Object.freeze({
      decodedBytes: 256 * 128 * 4,
      height: 128,
      path: "/textures/planets/earth-city-lights-low.webp",
      width: 256,
    }),
    medium: Object.freeze({
      decodedBytes: 1024 * 512 * 4,
      height: 512,
      path: "/textures/planets/earth-city-lights-medium.webp",
      width: 1024,
    }),
    high: Object.freeze({
      decodedBytes: 4096 * 2048 * 4,
      height: 2048,
      path: "/textures/planets/earth-city-lights-high.webp",
      width: 4096,
    }),
  }),
});

export function textureVariantFor(
  bodyId: TextureBodyId,
  quality: TextureVariantName,
): PlanetTextureVariant {
  return planetTextureSources[bodyId].variants[quality];
}

export const saturnRingTextureVariants: Readonly<
  Record<TextureVariantName, PlanetTextureVariant>
> = Object.freeze({
  low: Object.freeze({
    decodedBytes: 512 * 32 * 4,
    height: 32,
    path: "/textures/rings/saturn-low.webp",
    width: 512,
  }),
  medium: Object.freeze({
    decodedBytes: 2048 * 125 * 4,
    height: 125,
    path: "/textures/rings/saturn-medium.webp",
    width: 2048,
  }),
  high: Object.freeze({
    decodedBytes: 4096 * 250 * 4,
    height: 250,
    path: "/textures/rings/saturn-high.webp",
    width: 4096,
  }),
});
