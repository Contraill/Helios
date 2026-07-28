import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BodyDetailPage } from "@/features/body-details/components/body-detail-page";
import {
  createRegionDetailModel,
  detailDescription,
  detailName,
} from "@/features/body-details/lib/body-detail-model";
import {
  isSystemRegionIdValue,
  SYSTEM_REGION_IDS,
} from "@/features/solar-system/types/celestial-body";

import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

interface RegionPageProps {
  readonly params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export function generateStaticParams() {
  return SYSTEM_REGION_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  if (!isSystemRegionIdValue(slug)) return {};

  return createPageMetadata({
    canonical: `/region/${slug}`,
    description: detailDescription(slug, locale),
    locale,
    title: detailName(slug, locale),
  });
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  if (!isSystemRegionIdValue(slug)) notFound();

  return (
    <BodyDetailPage
      locale={locale}
      model={createRegionDetailModel(slug, locale)}
    />
  );
}
