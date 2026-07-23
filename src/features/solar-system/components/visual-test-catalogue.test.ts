import { describe, expect, it } from "vitest";

import {
  catalogueEvidenceIdsFor,
  catalogueIdsFor,
  cataloguePageFor,
  VISUAL_CATALOGUE_PAGE_SIZE,
} from "./visual-test-catalogue";

describe("Gate 3B visual catalogue", () => {
  it("keeps the accepted group counts", () => {
    expect(catalogueIdsFor("moons")).toHaveLength(22);
    expect(catalogueIdsFor("dwarf-systems")).toHaveLength(15);
    expect(catalogueIdsFor("asteroids")).toHaveLength(4);
    expect(catalogueIdsFor("dwarf-kuiper")).toHaveLength(8);
    expect(catalogueIdsFor("comets")).toHaveLength(6);
  });

  it("paginates deterministically with six to eight bodies on multi-page groups", () => {
    expect(VISUAL_CATALOGUE_PAGE_SIZE).toBe(8);
    const moonPages = [1, 2, 3].map((page) => cataloguePageFor("moons", page));
    expect(moonPages.map(({ ids }) => ids.length)).toEqual([8, 8, 6]);
    expect(moonPages.flatMap(({ ids }) => ids)).toEqual(
      catalogueIdsFor("moons"),
    );
    expect(cataloguePageFor("moons", 999).page).toBe(3);
    expect(cataloguePageFor("moons", -4).page).toBe(1);
  });

  it("provides the required labelled human-eye evidence groups", () => {
    expect(catalogueEvidenceIdsFor("earth-mars-moons")).toHaveLength(3);
    expect(catalogueEvidenceIdsFor("galilean-moons")).toHaveLength(4);
    expect(catalogueEvidenceIdsFor("saturn-moons-1")).toHaveLength(4);
    expect(catalogueEvidenceIdsFor("saturn-moons-2")).toHaveLength(3);
    expect(catalogueEvidenceIdsFor("uranus-moons")).toHaveLength(5);
    expect(catalogueEvidenceIdsFor("neptune-moons")).toHaveLength(3);
    expect(catalogueEvidenceIdsFor("main-belt-worlds")).toHaveLength(4);
    expect(catalogueEvidenceIdsFor("dwarf-worlds-1")).toHaveLength(4);
    expect(catalogueEvidenceIdsFor("dwarf-worlds-2")).toHaveLength(4);
    expect(catalogueEvidenceIdsFor("unknown-group")).toBeNull();
  });

  it("does not duplicate bodies between pages", () => {
    for (const mode of ["moons", "dwarf-systems"] as const) {
      const first = cataloguePageFor(mode, 1);
      const all = Array.from(
        { length: first.pageCount },
        (_, index) => cataloguePageFor(mode, index + 1).ids,
      ).flat();
      expect(new Set(all).size).toBe(all.length);
      expect(all).toEqual(catalogueIdsFor(mode));
    }
  });
});
