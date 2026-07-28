export type CelestialAssetClassification =
  | "real-map"
  | "derived-map"
  | "procedural-reconstruction"
  | "fallback-only"
  | "missing"
  | "malformed-metadata";

export interface CelestialBodyBaseline {
  readonly id: string;
  readonly category: string;
  readonly geometryKind: string;
  readonly geometryScale: readonly [number, number, number];
  readonly assetPath: string;
  readonly assetRepresentation: string;
  readonly textureDimensions: readonly [number, number] | null;
  readonly textureReadiness: string;
  readonly orientationSourceId: string;
  readonly primeMeridianVerified: boolean;
  readonly rotationSense: string;
  readonly atmosphere: boolean;
  readonly ring: boolean;
  readonly cometTail: boolean;
  readonly orbitMounted: boolean;
  readonly selectable: boolean;
  readonly focusRadius: number;
  readonly classification: CelestialAssetClassification;
}

export interface CelestialBaselineArtifact {
  readonly schemaVersion: 1;
  readonly baseCommit: string;
  readonly bodies: readonly CelestialBodyBaseline[];
  readonly summary: {
    readonly total: number;
    readonly realMap: number;
    readonly derivedMap: number;
    readonly proceduralReconstruction: number;
    readonly fallbackOnly: number;
    readonly missing: number;
    readonly malformedMetadata: number;
  };
}
