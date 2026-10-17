import { describe, expect, it } from "vitest";

import { CELESTIAL_DETAIL_SLUGS } from "@/features/solar-system/lib/celestial-detail-routes";
import { isSystemRegionIdValue } from "@/features/solar-system/types/celestial-body";

import robots from "./robots";
import sitemap from "./sitemap";

describe("public route discovery", () => {
  it("publishes every canonical destination once per language", () => {
    const entries = sitemap();
    const paths = entries.map(({ url }) => new URL(url).pathname);

    expect(paths).toHaveLength(2 * (7 + CELESTIAL_DETAIL_SLUGS.length));
    expect(new Set(paths).size).toBe(paths.length);

    for (const slug of CELESTIAL_DETAIL_SLUGS) {
      const expectedPath = isSystemRegionIdValue(slug)
        ? `/region/${slug}`
        : `/body/${slug}`;
      expect(paths).toContain(expectedPath);
      expect(paths).toContain(`/tr${expectedPath}`);
    }
    expect(paths).toContain("/tr");
    expect(entries[0].alternates?.languages).toEqual({
      en: expect.stringMatching(/\/$/),
      tr: expect.stringMatching(/\/tr$/),
      "x-default": expect.stringMatching(/\/$/),
    });

    expect(paths.some((path) => path.startsWith("/planet/"))).toBe(false);
    expect(paths.some((path) => path.startsWith("/object/"))).toBe(false);
  });

  it("keeps crawlers away from API routes and points to the sitemap", () => {
    const policy = robots();
    expect(policy.rules).toEqual(
      expect.objectContaining({ allow: "/", disallow: "/api/" }),
    );
    expect(policy.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
