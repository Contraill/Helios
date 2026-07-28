import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "@/lib/metadata/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
