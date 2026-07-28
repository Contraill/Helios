import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/home-experience";
import { loadApodArchive } from "@/lib/data/external/providers/space-data.server";
import { landingCopy } from "@/lib/i18n/landing-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    canonical: "/",
    description: landingCopy[locale].home.metadataDescription,
    locale,
  });
}

export const revalidate = 60;

export default async function HomePage() {
  const locale = await getRequestLocale();
  const apod = await loadApodArchive();

  return (
    <HomeExperience
      initialLocale={locale}
      metadata={apod.metadata}
      records={apod.data ?? []}
      status={apod.status}
    />
  );
}
