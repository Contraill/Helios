import type { Metadata } from "next";

import { MissionsExperience } from "@/features/missions/components/missions-experience";
import {
  MISSION_CATALOGUE,
  MISSION_PLANET_COUNT,
} from "@/features/missions/lib/mission-catalogue";
import { landingCopy } from "@/lib/i18n/landing-copy";
import {
  getRequestLocale,
  type LocaleRouteProps,
} from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const locale = await getRequestLocale(params);
  return createPageMetadata({
    canonical: "/missions",
    description: landingCopy[locale].missions.metadataDescription,
    locale,
    title: landingCopy[locale].missions.hero.title,
  });
}

export default async function MissionsPage() {
  return (
    <MissionsExperience
      missions={MISSION_CATALOGUE}
      planetCount={MISSION_PLANET_COUNT}
    />
  );
}
