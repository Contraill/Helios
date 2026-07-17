import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planetIds, planets } from "@/content/planets";
import { MarsDetailPage } from "@/features/planet-details/components/mars-detail-page";
import { PlanetDetailPage } from "@/features/planet-details/components/planet-detail-page";
import { createPlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";
import { uiStrings } from "@/lib/i18n/ui-strings";

interface PlanetPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return planetIds.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PlanetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const planet = getPlanetById(slug);

  if (!planet) return { title: uiStrings.pages.notFound.title };

  return {
    title: planet.name.en,
    description: planet.description.en,
  };
}

export default async function PlanetPage({ params }: PlanetPageProps) {
  const { slug } = await params;
  const planet = getPlanetById(slug);

  if (!planet) notFound();

  const content = getPlanetDetailContent(planet.id);
  const model = createPlanetDetailModel(planet, planets, content.sourceIds);

  if (planet.id === "mars") {
    return <MarsDetailPage model={model} />;
  }

  return <PlanetDetailPage content={content} model={model} />;
}
