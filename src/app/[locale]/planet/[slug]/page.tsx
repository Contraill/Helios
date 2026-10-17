import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPlanetById, planetIds } from "@/content/planets";
import { PlanetBodyRoute } from "@/features/body-details/components/planet-body-route";

import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

interface PlanetPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export function generateStaticParams() {
  return planetIds.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PlanetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const planet = getPlanetById(slug);

  if (!planet) return {};

  return createPageMetadata({
    canonical: `/body/${planet.id}`,
    description: planet.description[locale],
    locale,
    title: planet.name[locale],
  });
}

export default async function PlanetPage({ params }: PlanetPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const planet = getPlanetById(slug);

  if (!planet) notFound();

  return <PlanetBodyRoute locale={locale} slug={planet.id} />;
}
