import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planetIds, planets } from "@/content/planets";
import { EarthObservatory } from "@/features/space-data/components/earth-observatory";
import { MarsArchive } from "@/features/space-data/components/mars-archive";
import {
  loadEarthObservatoryData,
  loadMarsArchiveData,
} from "@/features/space-data/lib/planet-data.server";
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
    const archive = await loadMarsArchiveData();
    return (
      <MarsDetailPage
        model={model}
        supplement={
          <MarsArchive
            media={archive.media}
            trek={archive.trek}
            weather={archive.weather}
          />
        }
      />
    );
  }

  if (planet.id === "earth") {
    const observatory = await loadEarthObservatoryData();
    return (
      <PlanetDetailPage
        content={content}
        model={model}
        showHumanScale={false}
        supplement={
          <EarthObservatory
            donki={{
              data: observatory.donki.data ?? [],
              metadata: observatory.donki.metadata,
              status: observatory.donki.status,
            }}
            eonet={{
              data: observatory.eonet.data ?? [],
              metadata: observatory.eonet.metadata,
              status: observatory.eonet.status,
            }}
            epic={{
              data: observatory.epic.data ?? [],
              metadata: observatory.epic.metadata,
              status: observatory.epic.status,
            }}
            gibs={{
              data: observatory.gibs.data ?? [],
              metadata: observatory.gibs.metadata,
              status: observatory.gibs.status,
            }}
            nearEarth={{
              data: observatory.nearEarth.data ?? [],
              metadata: observatory.nearEarth.metadata,
              status: observatory.nearEarth.status,
            }}
          />
        }
      />
    );
  }

  return <PlanetDetailPage content={content} model={model} />;
}
