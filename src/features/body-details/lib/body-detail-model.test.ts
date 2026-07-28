import { describe, expect, it } from "vitest";

import { planetIds } from "@/content/planets";
import { CELESTIAL_SCOPE } from "@/features/solar-system/lib/celestial-scope";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
} from "@/features/solar-system/types/celestial-body";

import {
  bodyDetailHref,
  bodyName,
  CELESTIAL_DETAIL_SLUGS,
  celestialDetailHref,
  createNonPlanetBodyDetailModel,
  createRegionDetailModel,
  detailDescription,
  detailName,
  isCelestialDetailSlug,
  isRealBodySlug,
  REAL_BODY_SLUGS,
} from "./body-detail-model";

describe("celestial detail route model", () => {
  it("covers 57 real bodies and four regional context pages", () => {
    expect(REAL_BODY_SLUGS).toHaveLength(57);
    expect(new Set(REAL_BODY_SLUGS).size).toBe(57);
    expect(CELESTIAL_DETAIL_SLUGS).toHaveLength(61);
    expect(new Set(CELESTIAL_DETAIL_SLUGS).size).toBe(61);
    expect(CELESTIAL_SCOPE).toEqual({
      planets: planetIds.length,
      featuredMoons: FEATURED_MOON_IDS.length,
      extendedBodies: EXTENDED_BODY_IDS.length,
      dwarfSatellites: DWARF_SATELLITE_IDS.length,
      realBodies: REAL_BODY_SLUGS.length,
      systemRegions: SYSTEM_REGION_IDS.length,
      detailDestinations: CELESTIAL_DETAIL_SLUGS.length,
    });

    expect(REAL_BODY_SLUGS).toEqual(
      expect.arrayContaining([
        "sun",
        ...planetIds,
        ...FEATURED_MOON_IDS,
        ...EXTENDED_BODY_IDS,
        ...DWARF_SATELLITE_IDS,
      ]),
    );

    for (const slug of REAL_BODY_SLUGS) {
      expect(isRealBodySlug(slug)).toBe(true);
      expect(isCelestialDetailSlug(slug)).toBe(true);
      expect(bodyDetailHref(slug)).toBe(`/body/${slug}`);
      expect(celestialDetailHref(slug)).toBe(`/body/${slug}`);
      expect(bodyName(slug)).not.toBe("");
      expect(detailName(slug)).not.toBe("");
      expect(detailDescription(slug).length).toBeLessThanOrEqual(160);
    }

    for (const region of SYSTEM_REGION_IDS) {
      expect(isRealBodySlug(region)).toBe(false);
      expect(isCelestialDetailSlug(region)).toBe(true);
      expect(bodyDetailHref(region)).toBeNull();
      expect(celestialDetailHref(region)).toBe(`/region/${region}`);
      expect(detailName(region)).not.toBe("");
      expect(detailDescription(region).length).toBeLessThanOrEqual(160);
    }
  });

  it("builds complete models for the Sun and every non-planet catalogue body", () => {
    const slugs = REAL_BODY_SLUGS.filter(
      (slug) => !planetIds.includes(slug as (typeof planetIds)[number]),
    );

    expect(slugs).toHaveLength(49);

    for (const slug of slugs) {
      const model = createNonPlanetBodyDetailModel(
        slug as Exclude<
          (typeof REAL_BODY_SLUGS)[number],
          (typeof planetIds)[number]
        >,
      );
      expectCompleteModel(model);
      expect(model.visualAssetPath).toMatch(/^\/textures\//);
      expect(model.visualGeometry).toMatch(
        /^(sphere|ellipsoid|irregular|bilobed)$/,
      );
    }
  });

  it("builds distinct, sourced models for every regional context page", () => {
    const visualKinds = new Set<string>();

    for (const region of SYSTEM_REGION_IDS) {
      const model = createRegionDetailModel(region);
      expectCompleteModel(model);
      expect(model.visualAssetPath).toBeUndefined();
      expect(model.visualGeometry).toBeUndefined();
      expect(model.metrics.length).toBeGreaterThanOrEqual(6);
      expect(model.sections).toHaveLength(3);
      expect(model.modelLabel).toBe("Spatial representation");
      expect(model.visualLabel).toBe("Visual representation");
      visualKinds.add(model.visualKind);
    }

    expect(visualKinds).toEqual(new Set(["belt", "cloud", "boundary"]));
  });

  it("keeps the Oort Cloud edge estimates distinct", () => {
    const model = createRegionDetailModel("oort-cloud");

    expect(model.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Estimated inner edge",
          value: "2,000–5,000 AU",
        }),
        expect.objectContaining({
          label: "Estimated outer edge",
          value: "10,000–100,000 AU",
        }),
      ]),
    );
  });

  it("keeps extended-body suggestions inside useful catalogue groups", () => {
    expect(
      createNonPlanetBodyDetailModel("hygiea").related.map(({ id }) => id),
    ).not.toContain("pluto");
    expect(
      createNonPlanetBodyDetailModel("pluto").related.map(({ id }) => id),
    ).not.toContain("hygiea");
    expect(
      createNonPlanetBodyDetailModel("orcus").related.map(({ id }) => id),
    ).not.toContain("halley");
    expect(
      createNonPlanetBodyDetailModel("halley").related.map(({ id }) => id),
    ).not.toContain("orcus");
  });
});

function expectCompleteModel(model: {
  readonly name: string;
  readonly tagline: string;
  readonly overview: string;
  readonly metrics: readonly unknown[];
  readonly sections: readonly { readonly body: string }[];
  readonly sourceLinks: readonly unknown[];
  readonly representationNote: string;
  readonly surfaceNote: string;
}) {
  expect(model.name).not.toBe("");
  expect(model.tagline.length).toBeGreaterThan(20);
  expect(model.overview.length).toBeGreaterThan(60);
  expect(model.metrics.length).toBeGreaterThanOrEqual(4);
  expect(model.sections.length).toBeGreaterThanOrEqual(2);
  expect(model.sourceLinks.length).toBeGreaterThan(0);
  expect(model.representationNote.length).toBeGreaterThan(20);
  expect(model.surfaceNote.length).toBeGreaterThan(10);

  const sectionBodies = model.sections.map((section) => section.body);
  expect(new Set(sectionBodies).size).toBe(sectionBodies.length);
  expect(sectionBodies).not.toContain(model.representationNote);
  expect(sectionBodies).not.toContain(model.surfaceNote);
}
