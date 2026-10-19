import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/home-experience";
import { loadApodArchive } from "@/lib/data/external/providers/space-data.server";
import { landingCopy } from "@/lib/i18n/landing-copy";
import {
  getRequestLocale,
  type LocaleRouteProps,
} from "@/lib/i18n/request-locale.server";
import { siteCopy } from "@/lib/i18n/site-copy";
import { createPageMetadata } from "@/lib/metadata/page-metadata";
import { absoluteSiteUrl } from "@/lib/metadata/site-url";

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const locale = await getRequestLocale(params);
  return createPageMetadata({
    canonical: "/",
    description: landingCopy[locale].home.metadataDescription,
    locale,
  });
}

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: LocaleRouteProps) {
  const [apod, locale] = await Promise.all([
    loadApodArchive(),
    getRequestLocale(params),
  ]);
  // Lets Google show "Helios" as the site name in results.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteCopy[locale].site.name,
    url: absoluteSiteUrl("/"),
    description: siteCopy[locale].site.tagline,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeExperience
        metadata={apod.metadata}
        records={apod.data ?? []}
        status={apod.status}
      />
    </>
  );
}
