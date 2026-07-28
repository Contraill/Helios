import type { ExternalResult } from "@/lib/data/external/types";
import type {
  InsightWeatherRecord,
  MissionMediaRecord,
  TrekRegion,
} from "@/lib/data/external/models";
import type { Locale } from "@/lib/i18n/locale";
import { localeTag } from "@/lib/i18n/locale";
import { spaceDataCopy } from "@/lib/i18n/space-data-copy";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

export function MarsArchive({
  locale = "en",
  weather,
  trek,
  media,
}: {
  readonly locale?: Locale;
  readonly weather: ExternalResult<InsightWeatherRecord>;
  readonly trek: ExternalResult<readonly TrekRegion[]>;
  readonly media: ExternalResult<readonly MissionMediaRecord[]>;
}) {
  const copy = spaceDataCopy[locale].mars;
  const record = weather.data;
  return (
    <div className={styles.marsArchive}>
      <section
        aria-labelledby="insight-heading"
        className={styles.weatherSection}
      >
        <header>
          <p className={styles.eyebrow}>{copy.historicalEyebrow}</p>
          <h2 id="insight-heading">
            {record?.archiveMatch === "on-this-day"
              ? copy.onThisDay
              : copy.nearest(
                  new Intl.DateTimeFormat(localeTag(locale), {
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  }).format(new Date()),
                )}
          </h2>
          <p>{copy.intro}</p>
        </header>
        {record ? (
          <>
            <dl className={styles.weatherGrid}>
              <div>
                <dt>Sol</dt>
                <dd>{record.sol}</dd>
              </div>
              {record.temperatureC ? (
                <div>
                  <dt>{copy.temperature}</dt>
                  <dd>
                    {record.temperatureC.min.toFixed(1)} /{" "}
                    {record.temperatureC.average.toFixed(1)} /{" "}
                    {record.temperatureC.max.toFixed(1)}
                  </dd>
                  <small>{copy.minAvgMax}</small>
                </div>
              ) : null}
              {record.pressurePa ? (
                <div>
                  <dt>{copy.pressure}</dt>
                  <dd>
                    {record.pressurePa.min.toFixed(1)} /{" "}
                    {record.pressurePa.average.toFixed(1)} /{" "}
                    {record.pressurePa.max.toFixed(1)}
                  </dd>
                </div>
              ) : null}
              {record.windMps ? (
                <div>
                  <dt>{copy.wind}</dt>
                  <dd>
                    {record.windMps.min.toFixed(1)} /{" "}
                    {record.windMps.average.toFixed(1)} /{" "}
                    {record.windMps.max.toFixed(1)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.direction}</dt>
                <dd>{record.windDirection}</dd>
              </div>
              <div>
                <dt>{copy.samples}</dt>
                <dd>{record.sampleCount.toLocaleString(localeTag(locale))}</dd>
              </div>
            </dl>
            <p className={styles.archiveDates}>
              <time dateTime={record.firstUtc}>{record.firstUtc}</time>{" "}
              {copy.to} <time dateTime={record.lastUtc}>{record.lastUtc}</time>{" "}
              · {copy.northern} {record.seasonNorthern} · {copy.southern}{" "}
              {record.seasonSouthern}
            </p>
          </>
        ) : (
          <p className={styles.empty}>{copy.unavailable}</p>
        )}
        <DataState metadata={weather.metadata} status={weather.status} />
      </section>

      <section aria-labelledby="trek-heading" className={styles.trekSection}>
        <header>
          <p className={styles.eyebrow}>{copy.trekEyebrow}</p>
          <h2 id="trek-heading">{copy.trekTitle}</h2>
          <p>{copy.trekIntro}</p>
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
              <a
                aria-label={copy.trekLabel(region.title)}
                href={region.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.trekOpen} <span aria-hidden="true">↗</span>
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
          <p className={styles.eyebrow}>{copy.mediaEyebrow}</p>
          <h2 id="mars-media-heading">{copy.mediaTitle}</h2>
        </header>
        <div className={styles.mediaGrid}>
          {(media.data ?? []).slice(0, 4).map((item) => (
            <article key={item.nasaId}>
              <RemoteMedia
                alt={item.title}
                fallbackLabel={copy.mediaFallback}
                src={item.thumbnailUrl}
              />
              <h3>{item.title}</h3>
              <time dateTime={item.dateCreated}>
                {item.dateCreated.slice(0, 10)}
              </time>
              <p>{item.excerpt}</p>
              <small>{item.creator ?? item.center ?? "NASA"}</small>
              <a
                aria-label={copy.mediaLabel(item.title)}
                href={item.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.mediaDetails} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
        <DataState compact metadata={media.metadata} status={media.status} />
      </section>
    </div>
  );
}
