import { z } from "zod";

import { sourcedNumberSchema } from "./planet";
import { localizedTextSchema } from "./source";

export const sunSchema = z
  .object({
    id: z.literal("sun"),
    name: localizedTextSchema,
    physical: z
      .object({
        meanRadiusKm: sourcedNumberSchema.refine(
          ({ value }) => value > 0,
          "Sun radius must be positive",
        ),
      })
      .strict(),
    sourceIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type SunData = z.infer<typeof sunSchema>;
