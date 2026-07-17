import { describe, expect, it } from "vitest";

import { planets } from "@/content/planets";
import { planetaryReferenceSourceById } from "@/content/sources/planetary-reference";

import { getPlanetDetailContent } from "./index";

const contentRecords = planets.map(({ id }) => getPlanetDetailContent(id));

function collectDetailSourceIds(
  content: ReturnType<typeof getPlanetDetailContent>,
): readonly string[] {
  return [
    ...content.sourceIds,
    ...content.sections.flatMap(({ sourceIds }) => sourceIds),
    ...content.missions.flatMap(({ sourceIds }) => sourceIds),
  ];
}

describe("planet detail content", () => {
  it("provides one complete record for every planet", () => {
    expect(contentRecords).toHaveLength(8);

    for (const [index, planet] of planets.entries()) {
      const content = contentRecords[index];
      expect(content.id).toBe(planet.id);
      expect(content.sections.length).toBeGreaterThanOrEqual(2);
      expect(content.missions.length).toBeGreaterThanOrEqual(1);
      expect(content.methodology.title.length).toBeGreaterThan(0);
      expect(content.methodology.body.length).toBeGreaterThan(0);
      expect(content.humanScale.title.length).toBeGreaterThan(0);
      expect(content.humanScale.body.length).toBeGreaterThan(0);
    }
  });

  it("resolves every editorial and mission source through the registry", () => {
    for (const content of contentRecords) {
      const sourceIds = collectDetailSourceIds(content);
      expect(sourceIds.length).toBeGreaterThan(0);

      for (const sourceId of sourceIds) {
        expect(
          planetaryReferenceSourceById.has(sourceId),
          `${content.id} references unknown source ${sourceId}`,
        ).toBe(true);
      }
    }
  });

  it("does not force every planet into the same section sequence", () => {
    const layouts = contentRecords.map(({ layout }) => layout.join("/"));
    expect(new Set(layouts).size).toBeGreaterThanOrEqual(6);
    expect(layouts).toContain(
      "metrics/story/human/missions/signals/methodology",
    );
    expect(layouts).toContain(
      "human/metrics/story/signals/missions/methodology",
    );
  });

  it("keeps mission source provenance attached to each mission", () => {
    for (const content of contentRecords) {
      for (const mission of content.missions) {
        expect(mission.sourceIds.length).toBeGreaterThan(0);
        expect(mission.name.length).toBeGreaterThan(0);
        expect(mission.status.length).toBeGreaterThan(0);
      }
    }
  });
});
