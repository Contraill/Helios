import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPlanetById, isPlanetId } from "@/content/planets";
import { BodyDetailPage } from "@/features/body-details/components/body-detail-page";
import { PlanetBodyRoute } from "@/features/body-details/components/planet-body-route";
import {
  bodyDescription,
  bodyName,
  createNonPlanetBodyDetailModel,
  isRealBodySlug,
  REAL_BODY_SLUGS,
} from "@/features/body-details/lib/body-detail-model";

import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

interface BodyPageProps {
  readonly params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export function generateStaticParams() {
  return REAL_BODY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BodyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  if (!isRealBodySlug(slug)) return {};

  return createPageMetadata({
    canonical: `/body/${slug}`,
    description: bodyDescription(slug, locale),
    locale,
    title: bodyName(slug, locale),
  });
}

export default async function BodyPage({ params }: BodyPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  if (!isRealBodySlug(slug)) notFound();

  if (isPlanetId(slug)) {
    if (!getPlanetById(slug)) notFound();
    return <PlanetBodyRoute locale={locale} slug={slug} />;
  }

  return (
    <BodyDetailPage
      locale={locale}
      model={createNonPlanetBodyDetailModel(slug, locale)}
    />
  );
}
