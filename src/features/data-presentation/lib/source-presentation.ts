import { planetaryReferenceSourceById } from "@/content/sources/planetary-reference";
import type { SourcePresentation } from "@/features/data-presentation/types/presentation";

export function createSourcePresentations(
  sourceIds: readonly string[],
): readonly SourcePresentation[] {
  return Object.freeze(
    [...new Set(sourceIds)].map((sourceId) => {
      const source = planetaryReferenceSourceById.get(sourceId);
      if (!source) throw new Error(`Unknown source id: ${sourceId}`);

      return Object.freeze({
        accessedAt: source.accessedAt,
        freshness: source.freshness,
        id: source.id,
        ...(source.notes ? { notes: source.notes.en } : {}),
        provider: source.provider,
        ...(source.publishedOrUpdatedAt
          ? { publishedOrUpdatedAt: source.publishedOrUpdatedAt }
          : {}),
        title: source.title,
        url: source.url,
      });
    }),
  );
}
