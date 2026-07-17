import { z } from "zod";

export const dataFreshnessSchema = z.enum([
  "live",
  "near-live",
  "latest-available",
  "historical",
  "reference",
]);

export const localizedTextSchema = z
  .object({
    en: z.string().min(1),
    tr: z.string().min(1),
  })
  .strict();

/** Accepts an ISO month or date without inventing day-level precision. */
export const sourceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(?:-\d{2})?$/, "Expected YYYY-MM or YYYY-MM-DD");

export const dataSourceReferenceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    provider: z.string().min(1),
    title: z.string().min(1),
    url: z.string().url(),
    sourceType: z.enum(["api", "dataset", "article", "mission", "image"]),
    freshness: dataFreshnessSchema,
    accessedAt: sourceDateSchema,
    publishedOrUpdatedAt: sourceDateSchema.optional(),
    notes: localizedTextSchema.optional(),
  })
  .strict();

export type DataFreshness = z.infer<typeof dataFreshnessSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type DataSourceReference = z.infer<typeof dataSourceReferenceSchema>;
