export interface ApodRecord {
  readonly date: string;
  readonly title: string;
  readonly excerpt: string;
  readonly mediaType: "image" | "video";
  readonly mediaUrl: string;
  readonly thumbnailUrl?: string;
  readonly copyright?: string;
  readonly serviceVersion: string;
  readonly sourceUrl: string;
}

export interface EpicRecord {
  readonly identifier: string;
  readonly caption: string;
  readonly capturedAt: string;
  readonly imageUrl: string;
  readonly centroid: { readonly latitude: number; readonly longitude: number };
  readonly type: "natural" | "enhanced";
}

export type EonetCategory =
  | "wildfires"
  | "severeStorms"
  | "volcanoes"
  | "floods"
  | "seaLakeIce"
  | "dustHaze";

export interface EonetEvent {
  readonly id: string;
  readonly title: string;
  readonly category: EonetCategory;
  readonly status: "open" | "closed";
  readonly observedAt: string;
  readonly coordinates: readonly [number, number];
  readonly sourceUrl: string;
  readonly magnitude?: { readonly value: number; readonly unit: string };
}

export interface GibsLayer {
  readonly id: string;
  readonly title: string;
  readonly instrument: string;
  readonly observedAt: string;
  readonly imageUrl: string;
  readonly colorMode: "natural" | "false-color" | "analysis";
  readonly latencyNote: string;
  readonly attribution: string;
}

export type DonkiEventType = "FLR" | "CME" | "GST" | "notification";
export interface DonkiEvent {
  readonly id: string;
  readonly eventType: DonkiEventType;
  readonly title: string;
  readonly startAt: string;
  readonly peakAt?: string;
  readonly classOrIntensity?: string;
  readonly sourceLocation?: string;
  readonly linkedEventIds: readonly string[];
  readonly sourceUrl: string;
}

export interface NearEarthApproach {
  readonly id: string;
  readonly name: string;
  readonly approachAt: string;
  readonly missDistanceKm: number;
  readonly relativeVelocityKph: number;
  readonly diameterMinM: number;
  readonly diameterMaxM: number;
  readonly potentiallyHazardous: boolean;
  readonly sourceUrl: string;
}

export interface InsightWeatherRecord {
  readonly sol: number;
  readonly firstUtc: string;
  readonly lastUtc: string;
  readonly temperatureC: {
    readonly min: number;
    readonly average: number;
    readonly max: number;
  };
  readonly pressurePa: {
    readonly min: number;
    readonly average: number;
    readonly max: number;
  };
  readonly windMps: {
    readonly min: number;
    readonly average: number;
    readonly max: number;
  };
  readonly windDirection: string;
  readonly seasonNorthern: string;
  readonly seasonSouthern: string;
  readonly valid: boolean;
  readonly sampleCount: number;
}

export interface MissionMediaRecord {
  readonly nasaId: string;
  readonly title: string;
  readonly excerpt: string;
  readonly dateCreated: string;
  readonly center?: string;
  readonly keywords: readonly string[];
  readonly mediaType: "image" | "video";
  readonly thumbnailUrl?: string;
  readonly assetUrl?: string;
  readonly creator?: string;
  readonly sourceUrl: string;
}

export interface TrekRegion {
  readonly id: string;
  readonly world: "Mars" | "Mercury";
  readonly title: string;
  readonly coordinates: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly layerId: string;
  readonly product: string;
  readonly resolution: string;
  readonly representation:
    "natural" | "false-color" | "hillshade" | "DEM" | "mosaic";
  readonly previewUrl?: string;
  readonly sourceUrl: string;
}

export interface FireballRecord {
  readonly date: string;
  readonly energyKt: number;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly sourceUrl: string;
}
