import type { MissionMediaRecord } from "@/lib/data/external/models";
import type { ExternalResult } from "@/lib/data/external/types";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

export function PlanetMissionMedia({
  planetName,
  media,
}: {
  readonly planetName: string;
  readonly media: ExternalResult<readonly MissionMediaRecord[]>;
}) {
  return (
    <section
      aria-labelledby="planet-mission-media-heading"
      className={styles.mediaSection}
    >
      <header>
        <p className={styles.eyebrow}>NASA mission media</p>
        <h2 id="planet-mission-media-heading">
          {planetName}, through a mission archive
        </h2>
        <p>
          Every preview is resolved from that asset’s NASA manifest. A failed
          request can only fall back to media curated for {planetName}.
        </p>
      </header>
      {media.data?.length ? (
        <div className={styles.mediaGrid}>
          {media.data.slice(0, 3).map((item) => (
            <article key={item.nasaId}>
              <RemoteMedia
                alt={item.title}
                fallbackLabel="Mission media unavailable"
                src={item.thumbnailUrl ?? item.assetUrl}
              />
              <h3>{item.title}</h3>
              <time dateTime={item.dateCreated}>
                {item.dateCreated.slice(0, 10)}
              </time>
              <p>{item.excerpt}</p>
              <small>{item.creator ?? item.center ?? "NASA"}</small>
              <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                NASA media details
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No verified {planetName} mission preview is available.
        </p>
      )}
      <DataState compact metadata={media.metadata} status={media.status} />
    </section>
  );
}
