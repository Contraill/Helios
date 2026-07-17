import { sunSchema } from "@/lib/data/schemas/sun";

export const sun = sunSchema.parse({
  id: "sun",
  name: {
    en: "Sun",
    tr: "Güneş",
  },
  physical: {
    meanRadiusKm: {
      value: 695_700,
      sourceId: "nasa-sun-fact-sheet",
      derivation: "direct",
    },
  },
  sourceIds: ["nasa-sun-fact-sheet"],
});
