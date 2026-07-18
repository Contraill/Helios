"use client";

import { useState } from "react";

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
  const record = records[index];
  if (!record) {
    return (
      <section className={styles.apod} aria-labelledby="apod-heading">
        <div className={styles.apodMedia}>
          <RemoteMedia
            alt="Astronomy Picture of the Day"
            fallbackLabel="APOD media unavailable"
          />
        </div>
        <div className={styles.apodCopy}>
          <p className={styles.eyebrow}>Astronomy Picture of the Day</p>
          <h2 id="apod-heading">No dated APOD record is available</h2>
          <p className={styles.empty}>
            The Helios home page remains available without the remote record.
          </p>
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
          fallbackLabel="APOD media unavailable"
          src={mediaSrc}
        />
        <span className={styles.mediaType}>
          {record.mediaType === "video" ? "Video preview" : "Image"}
        </span>
      </div>
      <div className={styles.apodCopy}>
        <p className={styles.eyebrow}>Astronomy Picture of the Day</p>
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
            Previous day
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            Newer day
          </button>
          <a href={record.sourceUrl} rel="noreferrer" target="_blank">
            Open official record
          </a>
        </div>
        {record.copyright ? (
          <p className={styles.credit}>Copyright: {record.copyright}</p>
        ) : null}
        <p className={styles.credit}>Service {record.serviceVersion}</p>
        <DataState compact metadata={metadata} status={status} />
      </div>
    </section>
  );
}
