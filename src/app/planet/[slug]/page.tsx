import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPlanetById, planetIds, planets } from "@/content/planets";
import { PhasePlaceholder } from "@/components/ui/phase-placeholder";
import { MarsDetailPage } from "@/features/planet-details/components/mars-detail-page";
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

  if (planet.id === "mars") {
    return <MarsDetailPage model={createPlanetDetailModel(planet, planets)} />;
  }

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-16">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          {uiStrings.pages.planet.referenceDataReady}
        </p>
        <h1 className="font-display text-3xl">{planet.name.en}</h1>
        <p className="max-w-prose text-muted">{planet.tagline.en}</p>
      </header>
      <PhasePlaceholder
        description={uiStrings.pages.planet.placeholderFor(planet.name.en)}
      />
      <p>
        <Link
          href="/explore"
          className="text-muted underline-offset-4 hover:underline"
        >
          {uiStrings.pages.planet.backToExplore}
        </Link>
      </p>
    </article>
  );
}
