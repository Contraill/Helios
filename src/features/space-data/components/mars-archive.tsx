import type { ExternalResult } from "@/lib/data/external/types";
import type {
  InsightWeatherRecord,
  MissionMediaRecord,
  TrekRegion,
} from "@/lib/data/external/models";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

export function MarsArchive({
  weather,
  trek,
  media,
}: {
  readonly weather: ExternalResult<InsightWeatherRecord>;
  readonly trek: ExternalResult<readonly TrekRegion[]>;
  readonly media: ExternalResult<readonly MissionMediaRecord[]>;
}) {
  const record = weather.data;
  return (
    <div className={styles.marsArchive}>
      <section
        aria-labelledby="insight-heading"
        className={styles.weatherSection}
      >
        <header>
          <p className={styles.eyebrow}>Historical field record</p>
          <h2 id="insight-heading">
            Historical InSight weather at Elysium Planitia
          </h2>
          <p>
            This is a dated measurement from one landing site. It is not “Mars
            today.”
          </p>
        </header>
        {record ? (
          <>
            <dl className={styles.weatherGrid}>
              <div>
                <dt>Sol</dt>
                <dd>{record.sol}</dd>
              </div>
              <div>
                <dt>Temperature °C</dt>
                <dd>
                  {record.temperatureC.min.toFixed(1)} /{" "}
                  {record.temperatureC.average.toFixed(1)} /{" "}
                  {record.temperatureC.max.toFixed(1)}
                </dd>
                <small>min / average / max</small>
              </div>
              <div>
                <dt>Pressure Pa</dt>
                <dd>
                  {record.pressurePa.min.toFixed(1)} /{" "}
                  {record.pressurePa.average.toFixed(1)} /{" "}
                  {record.pressurePa.max.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt>Horizontal wind m/s</dt>
                <dd>
                  {record.windMps.min.toFixed(1)} /{" "}
                  {record.windMps.average.toFixed(1)} /{" "}
                  {record.windMps.max.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt>Common direction</dt>
                <dd>{record.windDirection}</dd>
              </div>
              <div>
                <dt>Samples</dt>
                <dd>{record.sampleCount.toLocaleString()}</dd>
              </div>
            </dl>
            <p className={styles.archiveDates}>
              <time dateTime={record.firstUtc}>{record.firstUtc}</time> to{" "}
              <time dateTime={record.lastUtc}>{record.lastUtc}</time> · northern{" "}
              {record.seasonNorthern} · southern {record.seasonSouthern}
            </p>
          </>
        ) : (
          <p className={styles.empty}>
            The historical InSight record is unavailable.
          </p>
        )}
        <DataState metadata={weather.metadata} status={weather.status} />
      </section>

      <section aria-labelledby="trek-heading" className={styles.trekSection}>
        <header>
          <p className={styles.eyebrow}>Surface context</p>
          <h2 id="trek-heading">Three places, three ways to read relief</h2>
          <p>
            Mars Trek products are imagery and terrain layers. They do not
            provide the planet’s orbital position.
          </p>
        </header>
        <div className={styles.trekGrid}>
          {(trek.data ?? []).map((region) => (
            <article key={region.id}>
              <div className={styles.trekOrb} aria-hidden="true" />
              <h3>{region.title}</h3>
              <p>
                {region.coordinates.latitude.toFixed(2)}°,{" "}
                {region.coordinates.longitude.toFixed(2)}°
              </p>
              <p>{region.product}</p>
              <code>{region.layerId}</code>
              <small>
                {region.resolution} · {region.representation}
              </small>
              <a href={region.sourceUrl} rel="noreferrer" target="_blank">
                Open Mars Trek
              </a>
            </article>
          ))}
        </div>
        <DataState compact metadata={trek.metadata} status={trek.status} />
      </section>

      <section
        aria-labelledby="mars-media-heading"
        className={styles.mediaSection}
      >
        <header>
          <p className={styles.eyebrow}>Mission media</p>
          <h2 id="mars-media-heading">
            The archive remembers where each image came from
          </h2>
        </header>
        <div className={styles.mediaGrid}>
          {(media.data ?? []).slice(0, 4).map((item) => (
            <article key={item.nasaId}>
              <RemoteMedia
                alt={item.title}
                fallbackLabel="Mission media unavailable"
                src={item.thumbnailUrl}
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
        <DataState compact metadata={media.metadata} status={media.status} />
      </section>
    </div>
  );
}
