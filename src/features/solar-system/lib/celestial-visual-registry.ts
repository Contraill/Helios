import type { DwarfSatelliteId, ExtendedBodyId, MoonId } from "@/features/solar-system/types/celestial-body";

export type VisualBodyId = MoonId | ExtendedBodyId | DwarfSatelliteId;
export type VisualAssetRepresentation = "real-map" | "derived-map" | "procedural-reconstruction";
export type VisualGeometryKind = "sphere" | "ellipsoid" | "irregular" | "bilobed";

export interface VisualOrientationMetadata {
  readonly projection: "equirectangular" | "procedural-equirectangular";
  readonly northPoleConvention: string;
  readonly flipY: boolean;
  readonly flipX: boolean;
  readonly textureLongitudeOffsetDeg: number;
  readonly rotationSense: "prograde" | "retrograde" | "tidally-locked" | "unknown";
  readonly primeMeridianVerified: boolean;
  readonly orientationSourceId: string;
  readonly visualCalibrationNote: string;
}

export interface CelestialVisualProfile {
  readonly id: VisualBodyId;
  readonly category: "featured-moon" | "asteroid" | "dwarf-kuiper" | "comet" | "dwarf-system-satellite";
  readonly geometry: { readonly kind: VisualGeometryKind; readonly scale: readonly [number, number, number]; readonly seed: number };
  readonly surface: { readonly assetPath: string; readonly representation: VisualAssetRepresentation; readonly fallbackColor: string; readonly roughness: number; readonly emissiveIntensity: number };
  readonly orientation: VisualOrientationMetadata;
  readonly atmosphere?: { readonly color: string; readonly scale: number; readonly opacity: number };
  readonly ring?: { readonly innerRadius: number; readonly outerRadius: number; readonly opacity: number; readonly color: string };
  readonly comet?: { readonly dustColor: string; readonly ionColor: string; readonly comaColor: string; readonly dustLength: number; readonly ionLength: number; readonly dustWidth: number; readonly ionWidth: number };
  readonly loadingPriority: number;
  readonly sourceId: string;
}

const profile = (value: CelestialVisualProfile): CelestialVisualProfile => Object.freeze(value);

export const CELESTIAL_VISUAL_REGISTRY: Readonly<Record<VisualBodyId, CelestialVisualProfile>> = Object.freeze({
  "moon-earth-moon": profile({
    id: "moon-earth-moon", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3545481695 },
    surface: { assetPath: "/textures/celestial/moon-earth-moon.webp", representation: "procedural-reconstruction", fallbackColor: "#76746e", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-earth-moon", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 95, sourceId: "helios-visual-moon-earth-moon",
  }),
  "moon-mars-phobos": profile({
    id: "moon-mars-phobos", category: "featured-moon",
    geometry: { kind: "irregular", scale: [1.22, 0.88, 0.78], seed: 1600773181 },
    surface: { assetPath: "/textures/celestial/moon-mars-phobos.webp", representation: "procedural-reconstruction", fallbackColor: "#4f463f", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-mars-phobos", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-mars-phobos",
  }),
  "moon-mars-deimos": profile({
    id: "moon-mars-deimos", category: "featured-moon",
    geometry: { kind: "irregular", scale: [1.18, 0.92, 0.84], seed: 1774152387 },
    surface: { assetPath: "/textures/celestial/moon-mars-deimos.webp", representation: "procedural-reconstruction", fallbackColor: "#635b53", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-mars-deimos", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-mars-deimos",
  }),
  "moon-jupiter-io": profile({
    id: "moon-jupiter-io", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3088019547 },
    surface: { assetPath: "/textures/celestial/moon-jupiter-io.webp", representation: "procedural-reconstruction", fallbackColor: "#dbb746", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-jupiter-io", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-jupiter-io",
  }),
  "moon-jupiter-europa": profile({
    id: "moon-jupiter-europa", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 652094999 },
    surface: { assetPath: "/textures/celestial/moon-jupiter-europa.webp", representation: "procedural-reconstruction", fallbackColor: "#bfb292", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-jupiter-europa", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 95, sourceId: "helios-visual-moon-jupiter-europa",
  }),
  "moon-jupiter-ganymede": profile({
    id: "moon-jupiter-ganymede", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 474163641 },
    surface: { assetPath: "/textures/celestial/moon-jupiter-ganymede.webp", representation: "procedural-reconstruction", fallbackColor: "#6f675c", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-jupiter-ganymede", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-jupiter-ganymede",
  }),
  "moon-jupiter-callisto": profile({
    id: "moon-jupiter-callisto", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 4087488459 },
    surface: { assetPath: "/textures/celestial/moon-jupiter-callisto.webp", representation: "procedural-reconstruction", fallbackColor: "#3f3a35", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-jupiter-callisto", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-jupiter-callisto",
  }),
  "moon-saturn-mimas": profile({
    id: "moon-saturn-mimas", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1208960001 },
    surface: { assetPath: "/textures/celestial/moon-saturn-mimas.webp", representation: "procedural-reconstruction", fallbackColor: "#979792", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-mimas", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-mimas",
  }),
  "moon-saturn-enceladus": profile({
    id: "moon-saturn-enceladus", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 4275550027 },
    surface: { assetPath: "/textures/celestial/moon-saturn-enceladus.webp", representation: "procedural-reconstruction", fallbackColor: "#dde1de", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-enceladus", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-enceladus",
  }),
  "moon-saturn-tethys": profile({
    id: "moon-saturn-tethys", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 263025473 },
    surface: { assetPath: "/textures/celestial/moon-saturn-tethys.webp", representation: "procedural-reconstruction", fallbackColor: "#b6b3a9", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-tethys", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-tethys",
  }),
  "moon-saturn-dione": profile({
    id: "moon-saturn-dione", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 4035417092 },
    surface: { assetPath: "/textures/celestial/moon-saturn-dione.webp", representation: "procedural-reconstruction", fallbackColor: "#a9aaa6", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-dione", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-dione",
  }),
  "moon-saturn-rhea": profile({
    id: "moon-saturn-rhea", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3402913859 },
    surface: { assetPath: "/textures/celestial/moon-saturn-rhea.webp", representation: "procedural-reconstruction", fallbackColor: "#9b9a96", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-rhea", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-rhea",
  }),
  "moon-saturn-titan": profile({
    id: "moon-saturn-titan", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2990612276 },
    surface: { assetPath: "/textures/celestial/moon-saturn-titan.webp", representation: "procedural-reconstruction", fallbackColor: "#b26b25", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-titan", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    atmosphere: { color: "#d88b31", scale: 0.24, opacity: 0.5 },
    loadingPriority: 95, sourceId: "helios-visual-moon-saturn-titan",
  }),
  "moon-saturn-iapetus": profile({
    id: "moon-saturn-iapetus", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2510398786 },
    surface: { assetPath: "/textures/celestial/moon-saturn-iapetus.webp", representation: "procedural-reconstruction", fallbackColor: "#aba596", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-saturn-iapetus", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-saturn-iapetus",
  }),
  "moon-uranus-miranda": profile({
    id: "moon-uranus-miranda", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1543903940 },
    surface: { assetPath: "/textures/celestial/moon-uranus-miranda.webp", representation: "procedural-reconstruction", fallbackColor: "#959591", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-uranus-miranda", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-uranus-miranda",
  }),
  "moon-uranus-ariel": profile({
    id: "moon-uranus-ariel", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3199280130 },
    surface: { assetPath: "/textures/celestial/moon-uranus-ariel.webp", representation: "procedural-reconstruction", fallbackColor: "#acb1b1", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-uranus-ariel", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-uranus-ariel",
  }),
  "moon-uranus-umbriel": profile({
    id: "moon-uranus-umbriel", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 432991847 },
    surface: { assetPath: "/textures/celestial/moon-uranus-umbriel.webp", representation: "procedural-reconstruction", fallbackColor: "#4f504f", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-uranus-umbriel", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-uranus-umbriel",
  }),
  "moon-uranus-titania": profile({
    id: "moon-uranus-titania", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1902933456 },
    surface: { assetPath: "/textures/celestial/moon-uranus-titania.webp", representation: "procedural-reconstruction", fallbackColor: "#8e918e", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-uranus-titania", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-uranus-titania",
  }),
  "moon-uranus-oberon": profile({
    id: "moon-uranus-oberon", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 4237380642 },
    surface: { assetPath: "/textures/celestial/moon-uranus-oberon.webp", representation: "procedural-reconstruction", fallbackColor: "#696560", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-uranus-oberon", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-uranus-oberon",
  }),
  "moon-neptune-proteus": profile({
    id: "moon-neptune-proteus", category: "featured-moon",
    geometry: { kind: "irregular", scale: [1.13, 0.94, 0.86], seed: 411447402 },
    surface: { assetPath: "/textures/celestial/moon-neptune-proteus.webp", representation: "procedural-reconstruction", fallbackColor: "#4e4b48", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-neptune-proteus", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-neptune-proteus",
  }),
  "moon-neptune-triton": profile({
    id: "moon-neptune-triton", category: "featured-moon",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1912152372 },
    surface: { assetPath: "/textures/celestial/moon-neptune-triton.webp", representation: "procedural-reconstruction", fallbackColor: "#b9b2a7", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-neptune-triton", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-neptune-triton",
  }),
  "moon-neptune-nereid": profile({
    id: "moon-neptune-nereid", category: "featured-moon",
    geometry: { kind: "irregular", scale: [1.08, 0.96, 0.91], seed: 4114520144 },
    surface: { assetPath: "/textures/celestial/moon-neptune-nereid.webp", representation: "procedural-reconstruction", fallbackColor: "#5f6365", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-moon-neptune-nereid", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-moon-neptune-nereid",
  }),
  "ceres": profile({
    id: "ceres", category: "asteroid",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2648457229 },
    surface: { assetPath: "/textures/celestial/ceres.webp", representation: "procedural-reconstruction", fallbackColor: "#6a6760", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-ceres", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-ceres",
  }),
  "vesta": profile({
    id: "vesta", category: "asteroid",
    geometry: { kind: "ellipsoid", scale: [1.05, 0.92, 0.84], seed: 2046382309 },
    surface: { assetPath: "/textures/celestial/vesta.webp", representation: "procedural-reconstruction", fallbackColor: "#847463", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-vesta", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-vesta",
  }),
  "pallas": profile({
    id: "pallas", category: "asteroid",
    geometry: { kind: "irregular", scale: [1.08, 0.94, 0.89], seed: 91480592 },
    surface: { assetPath: "/textures/celestial/pallas.webp", representation: "procedural-reconstruction", fallbackColor: "#5c5854", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-pallas", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-pallas",
  }),
  "hygiea": profile({
    id: "hygiea", category: "asteroid",
    geometry: { kind: "ellipsoid", scale: [1.03, 0.98, 0.96], seed: 915202374 },
    surface: { assetPath: "/textures/celestial/hygiea.webp", representation: "procedural-reconstruction", fallbackColor: "#2f302f", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-hygiea", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-hygiea",
  }),
  "pluto": profile({
    id: "pluto", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3297463797 },
    surface: { assetPath: "/textures/celestial/pluto.webp", representation: "procedural-reconstruction", fallbackColor: "#ae8e77", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-pluto", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    atmosphere: { color: "#a9c8dc", scale: 0.035, opacity: 0.12 },
    loadingPriority: 95, sourceId: "helios-visual-pluto",
  }),
  "eris": profile({
    id: "eris", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2719951012 },
    surface: { assetPath: "/textures/celestial/eris.webp", representation: "procedural-reconstruction", fallbackColor: "#c0bfb8", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-eris", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-eris",
  }),
  "haumea": profile({
    id: "haumea", category: "dwarf-kuiper",
    geometry: { kind: "ellipsoid", scale: [1.95, 1, 0.82], seed: 3267792838 },
    surface: { assetPath: "/textures/celestial/haumea.webp", representation: "procedural-reconstruction", fallbackColor: "#b9b9b1", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-haumea", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    ring: { innerRadius: 1.55, outerRadius: 2.12, opacity: 0.17, color: "#d8d4c9" },
    loadingPriority: 95, sourceId: "helios-visual-haumea",
  }),
  "makemake": profile({
    id: "makemake", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2264117871 },
    surface: { assetPath: "/textures/celestial/makemake.webp", representation: "procedural-reconstruction", fallbackColor: "#93694e", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-makemake", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-makemake",
  }),
  "quaoar": profile({
    id: "quaoar", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3642080751 },
    surface: { assetPath: "/textures/celestial/quaoar.webp", representation: "procedural-reconstruction", fallbackColor: "#865c4c", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-quaoar", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    ring: { innerRadius: 2.15, outerRadius: 2.42, opacity: 0.07, color: "#c9b6a4" },
    loadingPriority: 60, sourceId: "helios-visual-quaoar",
  }),
  "gonggong": profile({
    id: "gonggong", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3430050324 },
    surface: { assetPath: "/textures/celestial/gonggong.webp", representation: "procedural-reconstruction", fallbackColor: "#8e4637", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-gonggong", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-gonggong",
  }),
  "sedna": profile({
    id: "sedna", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 946863481 },
    surface: { assetPath: "/textures/celestial/sedna.webp", representation: "procedural-reconstruction", fallbackColor: "#77362d", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-sedna", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-sedna",
  }),
  "orcus": profile({
    id: "orcus", category: "dwarf-kuiper",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 314263880 },
    surface: { assetPath: "/textures/celestial/orcus.webp", representation: "procedural-reconstruction", fallbackColor: "#77766f", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-orcus", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 60, sourceId: "helios-visual-orcus",
  }),
  "halley": profile({
    id: "halley", category: "comet",
    geometry: { kind: "irregular", scale: [1.33, 0.74, 0.67], seed: 3904729172 },
    surface: { assetPath: "/textures/celestial/halley.webp", representation: "procedural-reconstruction", fallbackColor: "#23211e", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-halley", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#d9bf8f", ionColor: "#70c8ff", comaColor: "#def3e4", dustLength: 8.0, ionLength: 10.5, dustWidth: 0.28, ionWidth: 0.34 },
    loadingPriority: 60, sourceId: "helios-visual-halley",
  }),
  "hale-bopp": profile({
    id: "hale-bopp", category: "comet",
    geometry: { kind: "irregular", scale: [1.18, 0.86, 0.75], seed: 4289632555 },
    surface: { assetPath: "/textures/celestial/hale-bopp.webp", representation: "procedural-reconstruction", fallbackColor: "#33302b", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-hale-bopp", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#e2c796", ionColor: "#76bfff", comaColor: "#e9f2de", dustLength: 11.5, ionLength: 14.0, dustWidth: 0.42, ionWidth: 0.36 },
    loadingPriority: 60, sourceId: "helios-visual-hale-bopp",
  }),
  "encke": profile({
    id: "encke", category: "comet",
    geometry: { kind: "irregular", scale: [1.2, 0.82, 0.7], seed: 590490377 },
    surface: { assetPath: "/textures/celestial/encke.webp", representation: "procedural-reconstruction", fallbackColor: "#2b2825", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-encke", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#c5a87b", ionColor: "#5eaee8", comaColor: "#d9e6d6", dustLength: 5.0, ionLength: 6.8, dustWidth: 0.23, ionWidth: 0.2 },
    loadingPriority: 60, sourceId: "helios-visual-encke",
  }),
  "67p": profile({
    id: "67p", category: "comet",
    geometry: { kind: "bilobed", scale: [1.18, 0.82, 0.8], seed: 3303637966 },
    surface: { assetPath: "/textures/celestial/67p.webp", representation: "procedural-reconstruction", fallbackColor: "#242321", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-67p", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#c7ae82", ionColor: "#70bcec", comaColor: "#d7e6d9", dustLength: 6.8, ionLength: 8.5, dustWidth: 0.31, ionWidth: 0.24 },
    loadingPriority: 95, sourceId: "helios-visual-67p",
  }),
  "neowise": profile({
    id: "neowise", category: "comet",
    geometry: { kind: "irregular", scale: [1.16, 0.84, 0.76], seed: 1951384519 },
    surface: { assetPath: "/textures/celestial/neowise.webp", representation: "procedural-reconstruction", fallbackColor: "#302b25", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-neowise", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#e0bb82", ionColor: "#67b8f5", comaColor: "#e0efe0", dustLength: 9.5, ionLength: 12.0, dustWidth: 0.37, ionWidth: 0.32 },
    loadingPriority: 60, sourceId: "helios-visual-neowise",
  }),
  "tempel-1": profile({
    id: "tempel-1", category: "comet",
    geometry: { kind: "irregular", scale: [1.17, 0.9, 0.72], seed: 2492130493 },
    surface: { assetPath: "/textures/celestial/tempel-1.webp", representation: "procedural-reconstruction", fallbackColor: "#2d2b28", roughness: 0.96, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "unknown", primeMeridianVerified: false, orientationSourceId: "helios-visual-tempel-1", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    comet: { dustColor: "#c8ab80", ionColor: "#62a9dc", comaColor: "#d8e5d3", dustLength: 5.8, ionLength: 7.4, dustWidth: 0.26, ionWidth: 0.22 },
    loadingPriority: 60, sourceId: "helios-visual-tempel-1",
  }),
  "dwarf-satellite-charon": profile({
    id: "dwarf-satellite-charon", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1781617422 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-charon.webp", representation: "procedural-reconstruction", fallbackColor: "#817e7a", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-charon", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-charon",
  }),
  "dwarf-satellite-dysnomia": profile({
    id: "dwarf-satellite-dysnomia", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 856725129 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-dysnomia.webp", representation: "procedural-reconstruction", fallbackColor: "#53514e", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-dysnomia", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-dysnomia",
  }),
  "dwarf-satellite-hiiaka": profile({
    id: "dwarf-satellite-hiiaka", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2328644841 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-hiiaka.webp", representation: "procedural-reconstruction", fallbackColor: "#adaea8", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-hiiaka", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-hiiaka",
  }),
  "dwarf-satellite-namaka": profile({
    id: "dwarf-satellite-namaka", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3797864837 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-namaka.webp", representation: "procedural-reconstruction", fallbackColor: "#979791", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-namaka", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-namaka",
  }),
  "dwarf-satellite-mk2": profile({
    id: "dwarf-satellite-mk2", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2517591442 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-mk2.webp", representation: "procedural-reconstruction", fallbackColor: "#3d3935", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-mk2", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-mk2",
  }),
  "dwarf-satellite-weywot": profile({
    id: "dwarf-satellite-weywot", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 3998960329 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-weywot.webp", representation: "procedural-reconstruction", fallbackColor: "#4d423c", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-weywot", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-weywot",
  }),
  "dwarf-satellite-xiangliu": profile({
    id: "dwarf-satellite-xiangliu", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 2979271277 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-xiangliu.webp", representation: "procedural-reconstruction", fallbackColor: "#423a37", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-xiangliu", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-xiangliu",
  }),
  "dwarf-satellite-vanth": profile({
    id: "dwarf-satellite-vanth", category: "dwarf-system-satellite",
    geometry: { kind: "sphere", scale: [1, 1, 1], seed: 1141470863 },
    surface: { assetPath: "/textures/celestial/dwarf-satellite-vanth.webp", representation: "procedural-reconstruction", fallbackColor: "#706a62", roughness: 0.9, emissiveIntensity: 0 },
    orientation: { projection: "procedural-equirectangular", northPoleConvention: "visual-north-up; not navigation-grade", flipY: false, flipX: false, textureLongitudeOffsetDeg: 0, rotationSense: "tidally-locked", primeMeridianVerified: false, orientationSourceId: "helios-visual-dwarf-satellite-vanth", visualCalibrationNote: "Visual identity only; no navigation-grade longitude is claimed." },
    
    loadingPriority: 75, sourceId: "helios-visual-dwarf-satellite-vanth",
  }),
});

export const visualProfileFor = (id: VisualBodyId): CelestialVisualProfile => CELESTIAL_VISUAL_REGISTRY[id];
export const visualRegistryIds = Object.freeze(Object.keys(CELESTIAL_VISUAL_REGISTRY) as VisualBodyId[]);
