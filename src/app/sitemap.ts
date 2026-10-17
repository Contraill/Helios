import type { MetadataRoute } from "next";

import { REAL_BODY_SLUGS } from "@/features/solar-system/lib/celestial-detail-routes";
import { SYSTEM_REGION_IDS } from "@/features/solar-system/types/celestial-body";
import { localizedPath, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { languageAlternates } from "@/lib/metadata/page-metadata";
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
    ...STATIC_ROUTES.flatMap((path) =>
      sitemapEntries(path, path === "/" ? 1 : 0.8),
    ),
    ...REAL_BODY_SLUGS.flatMap((slug) => sitemapEntries(`/body/${slug}`, 0.7)),
    ...SYSTEM_REGION_IDS.flatMap((slug) =>
      sitemapEntries(`/region/${slug}`, 0.65),
    ),
  ];
}

/** One entry per locale, each listing every language variant for hreflang. */
function sitemapEntries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([language, href]) => [
      language,
      absoluteSiteUrl(href),
    ]),
  );
  return SUPPORTED_LOCALES.map((locale) => ({
    url: absoluteSiteUrl(localizedPath(path, locale)),
    changeFrequency: path === "/data" ? "daily" : "monthly",
    priority,
    alternates: { languages },
  }));
}
