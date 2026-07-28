import type { Metadata } from "next";

import { MissionsExperience } from "@/features/missions/components/missions-experience";
import {
  MISSION_CATALOGUE,
  MISSION_PLANET_COUNT,
} from "@/features/missions/lib/mission-catalogue";
import { landingCopy } from "@/lib/i18n/landing-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    canonical: "/missions",
    description: landingCopy[locale].missions.metadataDescription,
    locale,
    title: landingCopy[locale].missions.hero.title,
  });
}

export default async function MissionsPage() {
  const locale = await getRequestLocale();
  return (
    <MissionsExperience
      initialLocale={locale}
      missions={MISSION_CATALOGUE}
      planetCount={MISSION_PLANET_COUNT}
    />
  );
}
