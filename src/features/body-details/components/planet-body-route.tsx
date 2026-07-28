import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planets } from "@/content/planets";
import { MarsDetailPage } from "@/features/planet-details/components/mars-detail-page";
import { PlanetDetailPage } from "@/features/planet-details/components/planet-detail-page";
import { createPlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";
import { EarthObservatory } from "@/features/space-data/components/earth-observatory";
import { MarsArchive } from "@/features/space-data/components/mars-archive";
import { PlanetMissionMedia } from "@/features/space-data/components/planet-mission-media";
import {
  loadEarthObservatoryData,
  loadMarsArchiveData,
  loadPlanetMissionMedia,
} from "@/features/space-data/lib/planet-data.server";
import type { PlanetId } from "@/lib/data/schemas/planet";
import type { Locale } from "@/lib/i18n/locale";

export async function PlanetBodyRoute({
  locale = "en",
  slug,
}: {
  readonly locale?: Locale;
  readonly slug: PlanetId;
}) {
  const planet = getPlanetById(slug);

  if (!planet) return null;

  const content = getPlanetDetailContent(planet.id, locale);
  const model = createPlanetDetailModel(
    planet,
    planets,
    content.sourceIds,
    locale,
  );

  if (planet.id === "mars") {
    const archive = await loadMarsArchiveData();
    return (
      <MarsDetailPage
        locale={locale}
        model={model}
        supplement={
          <MarsArchive
            locale={locale}
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
        locale={locale}
        model={model}
        showHumanScale={false}
        supplement={
          <>
            <EarthObservatory
              locale={locale}
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
            <PlanetMissionMedia
              locale={locale}
              media={observatory.media}
              planetName={planet.name[locale]}
            />
          </>
        }
      />
    );
  }

  const media = await loadPlanetMissionMedia(planet.id);
  return (
    <PlanetDetailPage
      content={content}
      locale={locale}
      model={model}
      supplement={
        <PlanetMissionMedia
          locale={locale}
          media={media}
          planetName={planet.name[locale]}
        />
      }
    />
  );
}
