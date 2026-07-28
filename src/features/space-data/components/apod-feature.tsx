"use client";

import { useState } from "react";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import type { ApodRecord } from "@/lib/data/external/models";
import type {
  ExternalMetadata,
  ExternalDataStatus,
} from "@/lib/data/external/types";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

export function ApodFeature({
  records,
  metadata,
  status,
}: {
  readonly records: readonly ApodRecord[];
  readonly metadata: ExternalMetadata;
  readonly status: ExternalDataStatus;
}) {
  const [index, setIndex] = useState(0);
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale].apod;
  const record = records[index];
  if (!record) {
    return (
      <section className={styles.apod} aria-labelledby="apod-heading">
        <div className={styles.apodMedia}>
          <RemoteMedia alt={copy.title} fallbackLabel={copy.mediaUnavailable} />
        </div>
        <div className={styles.apodCopy}>
          <p className={styles.eyebrow}>{copy.title}</p>
          <h2 id="apod-heading">{copy.emptyTitle}</h2>
          <p className={styles.empty}>{copy.emptyBody}</p>
          <DataState compact metadata={metadata} status={status} />
        </div>
      </section>
    );
  }
  const mediaSrc =
    record.mediaType === "video" ? record.thumbnailUrl : record.mediaUrl;
  return (
    <section className={styles.apod} aria-labelledby="apod-heading">
      <div className={styles.apodMedia}>
        <RemoteMedia
          alt={record.title}
          fallbackLabel={copy.mediaUnavailable}
          src={mediaSrc}
        />
        <span className={styles.mediaType}>
          {record.mediaType === "video" ? copy.videoPreview : copy.image}
        </span>
      </div>
      <div className={styles.apodCopy}>
        <p className={styles.eyebrow}>{copy.title}</p>
        <h2 id="apod-heading">{record.title}</h2>
        <time dateTime={record.date}>{record.date}</time>
        <p>{record.excerpt}</p>
        <div className={styles.apodActions}>
          <button
            type="button"
            disabled={index >= records.length - 1}
            onClick={() =>
              setIndex((value) => Math.min(records.length - 1, value + 1))
            }
          >
            {copy.previous}
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            {copy.newer}
          </button>
          <a
            aria-label={copy.officialLabel(record.title)}
            href={record.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.official} <span aria-hidden="true">↗</span>
          </a>
        </div>
        {record.copyright ? (
          <p className={styles.credit}>
            {copy.copyright}: {record.copyright}
          </p>
        ) : null}
        <p className={styles.credit}>
          {copy.service} {record.serviceVersion}
        </p>
        <DataState compact metadata={metadata} status={status} />
      </div>
    </section>
  );
}
