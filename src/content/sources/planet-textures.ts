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

export const planetTextureSources: Readonly<
  Record<TextureBodyId, PlanetTextureSource>
> = Object.freeze({
  sun: Object.freeze({
    bodyId: "sun",
    sourceId: "nasa-sdo-pia26681",
    sourceUrl:
      "https://science.nasa.gov/photojournal/image-of-sun-from-nasas-solar-dynamics-observatory/",
    provider: "NASA Solar Dynamics Observatory",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/SDO; Helios procedural simulation",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("sun", 1024, 512),
  }),
  mercury: Object.freeze({
    bodyId: "mercury",
    sourceId: "nasa-messenger-pia17386",
    sourceUrl:
      "https://science.nasa.gov/photojournal/enhanced-color-mercury-map/",
    provider:
      "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JHUAPL/Carnegie Institution of Washington",
    representation: "enhanced-color-mosaic",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("mercury", 2048, 1024),
  }),
  venus: Object.freeze({
    bodyId: "venus",
    sourceId: "nasa-3d-venus-magellan",
    sourceUrl: "https://science.nasa.gov/3d-resources/venus/",
    provider: "NASA/JPL Magellan",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL Magellan; NASA 3D Resources",
    representation: "radar-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("venus", 1440, 720),
  }),
  earth: Object.freeze({
    bodyId: "earth",
    sourceId: "nasa-3d-earth-a",
    sourceUrl: "https://science.nasa.gov/3d-resources/earth-a/",
    provider: "USGS and NASA Jet Propulsion Laboratory",
    license: NASA_MEDIA_LICENSE,
    attribution: "USGS and NASA/JPL; NASA 3D Resources",
    representation: "topographic-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("earth", 1440, 720),
  }),
  mars: Object.freeze({
    bodyId: "mars",
    sourceId: "nasa-3d-mars-viking-usgs",
    sourceUrl: "https://science.nasa.gov/3d-resources/mars/",
    provider: "NASA/JPL/USGS Viking",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL/USGS Viking; NASA 3D Resources",
    representation: "imaging-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("mars", 1440, 720),
  }),
  jupiter: Object.freeze({
    bodyId: "jupiter",
    sourceId: "nasa-3d-jupiter-voyager",
    sourceUrl: "https://science.nasa.gov/3d-resources/jupiter/",
    provider: "NASA/JPL Voyager",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL Voyager; NASA 3D Resources",
    representation: "imaging-composite",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("jupiter", 720, 360),
  }),
  saturn: Object.freeze({
    bodyId: "saturn",
    sourceId: "nasa-3d-saturn-simulation",
    sourceUrl: "https://science.nasa.gov/3d-resources/saturn/",
    provider: "NASA/JPL",
    license: NASA_MEDIA_LICENSE,
    attribution: "NASA/JPL; NASA 3D Resources; simulated map",
    representation: "simulation",
    colorSpace: "srgb",
    materialSlot: "map",
    variants: variants("saturn", 720, 360),
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
    variants: variants("uranus", 1024, 512),
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
    variants: variants("neptune", 720, 360),
  }),
});

export function textureVariantFor(
  bodyId: TextureBodyId,
  quality: TextureVariantName,
  selected = false,
): PlanetTextureVariant {
  const effectiveVariant = quality === "high" && !selected ? "medium" : quality;
  return planetTextureSources[bodyId].variants[effectiveVariant];
}

export const saturnRingTextureVariants: Readonly<
  Record<TextureVariantName, PlanetTextureVariant>
> = Object.freeze({
  low: Object.freeze({
    decodedBytes: 128 * 128 * 4,
    height: 128,
    path: "/textures/rings/saturn-low.webp",
    width: 128,
  }),
  medium: Object.freeze({
    decodedBytes: 256 * 256 * 4,
    height: 256,
    path: "/textures/rings/saturn-medium.webp",
    width: 256,
  }),
  high: Object.freeze({
    decodedBytes: 512 * 512 * 4,
    height: 512,
    path: "/textures/rings/saturn-high.webp",
    width: 512,
  }),
});
