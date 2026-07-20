import { z } from "zod";

export const celestialRepresentationTypeSchema = z.enum([
  "horizons-window",
  "latest-available",
  "representative-mean-elements",
  "propagated-preview",
  "verified-fallback",
  "unavailable",
]);

export const orbitalReferenceFrameSchema = z.enum([
  "icrf-j2000",
  "ecliptic-j2000",
  "parent-equatorial-j2000",
  "local-laplace-plane",
]);

export const epochTimeScaleSchema = z.enum(["TDB"]);

export const orbitalEpochSchema = z
  .object({
    julianDate: z.number().finite(),
    timeScale: epochTimeScaleSchema,
    calendarLabel: z.string().min(1),
  })
  .strict();

export const recommendedRangeSchema = z
  .object({
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    note: z.string().min(1),
  })
  .strict();

export const celestialRepresentationSchema = z
  .object({
    provider: z.string().min(1),
    sourceId: z.string().min(1),
    sourceUrl: z.string().url(),
    targetCode: z.string().min(1).optional(),
    ephemerisId: z.string().min(1).optional(),
    referenceFrame: orbitalReferenceFrameSchema,
    referencePlane: z.string().min(1),
    epoch: orbitalEpochSchema,
    recommendedRange: recommendedRangeSchema.optional(),
    representationType: celestialRepresentationTypeSchema,
    precisionNote: z.string().min(1),
    retrievedAt: z.string().datetime().optional(),
    observedAt: z.string().datetime().optional(),
    fallbackReason: z.string().min(1).optional(),
  })
  .strict();

export type CelestialRepresentationType = z.infer<
  typeof celestialRepresentationTypeSchema
>;
export type OrbitalReferenceFrame = z.infer<typeof orbitalReferenceFrameSchema>;
export type OrbitalEpoch = z.infer<typeof orbitalEpochSchema>;
export type CelestialRepresentation = z.infer<
  typeof celestialRepresentationSchema
>;

export function representationTypeAt(
  representation: CelestialRepresentation,
  timestampMs: number,
): CelestialRepresentationType {
  const range = representation.recommendedRange;
  if (!range) return representation.representationType;
  const inside =
    timestampMs >= Date.parse(range.startIso) &&
    timestampMs <= Date.parse(range.endIso);
  if (inside) return representation.representationType;
  if (representation.representationType === "horizons-window") {
    return "propagated-preview";
  }
  return representation.representationType;
}

export function representationLabel(type: CelestialRepresentationType): string {
  switch (type) {
    case "horizons-window":
      return "Horizons ephemeris window";
    case "latest-available":
      return "Latest available source state";
    case "representative-mean-elements":
      return "Representative mean-elements preview";
    case "propagated-preview":
      return "Propagated preview outside the accurate window";
    case "verified-fallback":
      return "Verified fallback orbit";
    case "unavailable":
      return "Orbit unavailable";
  }
}
