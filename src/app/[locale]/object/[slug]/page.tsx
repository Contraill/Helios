import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BodyDetailPage } from "@/features/body-details/components/body-detail-page";
import {
  bodyDescription,
  bodyName,
  createNonPlanetBodyDetailModel,
} from "@/features/body-details/lib/body-detail-model";
import {
  EXTENDED_BODIES,
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";

import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

interface ObjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EXTENDED_BODIES.map(({ id: slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ObjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const body = isExtendedBodyId(slug) ? EXTENDED_BODY_BY_ID[slug] : null;
  return body
    ? createPageMetadata({
        canonical: `/body/${body.id}`,
        description: bodyDescription(body.id, locale),
        locale,
        title: bodyName(body.id, locale),
      })
    : {};
}

export default async function ObjectPage({ params }: ObjectPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  if (!isExtendedBodyId(slug)) notFound();

  return (
    <BodyDetailPage
      locale={locale}
      model={createNonPlanetBodyDetailModel(slug, locale)}
    />
  );
}
