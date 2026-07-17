import { z } from "zod";

import { dataFreshnessSchema, sourceDateSchema } from "./source";

export const observationMetadataSchema = z
  .object({
    provider: z.string().min(1),
    sourceTitle: z.string().min(1),
    sourceUrl: z.string().url(),
    freshness: dataFreshnessSchema,
    observedAt: z.string().datetime().optional(),
    retrievedAt: z.string().datetime(),
    location: z.string().min(1).optional(),
    instrument: z.string().min(1).optional(),
    sourceUpdatedAt: sourceDateSchema.optional(),
  })
  .strict();

export type ObservationMetadata = z.infer<typeof observationMetadataSchema>;
