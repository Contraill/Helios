import type { MissionMediaRecord } from "@/lib/data/external/models";
import type { ExternalResult } from "@/lib/data/external/types";
import type { Locale } from "@/lib/i18n/locale";
import { spaceDataCopy } from "@/lib/i18n/space-data-copy";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

export function PlanetMissionMedia({
  locale = "en",
  planetName,
  media,
}: {
  readonly locale?: Locale;
  readonly planetName: string;
  readonly media: ExternalResult<readonly MissionMediaRecord[]>;
}) {
  const copy = spaceDataCopy[locale].mission;
  return (
    <section
      aria-labelledby="planet-mission-media-heading"
      className={styles.mediaSection}
    >
      <header>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="planet-mission-media-heading">{copy.title(planetName)}</h2>
        <p>{copy.intro(planetName)}</p>
      </header>
      {media.data?.length ? (
        <div className={styles.mediaGrid}>
          {media.data.slice(0, 3).map((item) => (
            <article key={item.nasaId}>
              <RemoteMedia
                alt={item.title}
                fallbackLabel={copy.fallback}
                src={item.thumbnailUrl ?? item.assetUrl}
              />
              <h3>{item.title}</h3>
              <time dateTime={item.dateCreated}>
                {item.dateCreated.slice(0, 10)}
              </time>
              <p>{item.excerpt}</p>
              <small>{item.creator ?? item.center ?? "NASA"}</small>
              <a
                aria-label={copy.detailsLabel(item.title)}
                href={item.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.details} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{copy.empty(planetName)}</p>
      )}
      <DataState compact metadata={media.metadata} status={media.status} />
    </section>
  );
}
