import type { MetadataRoute } from "next";

import { REAL_BODY_SLUGS } from "@/features/solar-system/lib/celestial-detail-routes";
import { SYSTEM_REGION_IDS } from "@/features/solar-system/types/celestial-body";
import { absoluteSiteUrl } from "@/lib/metadata/site-url";

const STATIC_ROUTES = [
  "/",
  "/explore",
  "/compare",
  "/missions",
  "/data",
  "/about",
  "/case-study",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map((path) => sitemapEntry(path, path === "/" ? 1 : 0.8)),
    ...REAL_BODY_SLUGS.map((slug) => sitemapEntry(`/body/${slug}`, 0.7)),
    ...SYSTEM_REGION_IDS.map((slug) => sitemapEntry(`/region/${slug}`, 0.65)),
  ];
}

function sitemapEntry(
  path: string,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteSiteUrl(path),
    changeFrequency: path === "/data" ? "daily" : "monthly",
    priority,
  };
}
