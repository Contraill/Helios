"use client";

import type {
  ExternalDataStatus,
  ExternalMetadata,
} from "@/lib/data/external/types";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "./space-data.module.css";

import { formatDataStateDate } from "./data-state-format";

export function DataState({
  status,
  metadata,
  compact = false,
}: {
  readonly status: ExternalDataStatus;
  readonly metadata: ExternalMetadata;
  readonly compact?: boolean;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale].dataState;

  return (
    <div
      className={compact ? styles.stateCompact : styles.state}
      data-data-state
      data-status={status}
    >
      <span className={styles.stateLabel}>{copy.labels[status]}</span>
      <span>{metadata.provider}</span>
      {metadata.observedAt ? (
        <time dateTime={metadata.observedAt}>
          {copy.observed} {formatDataStateDate(metadata.observedAt, locale)}
        </time>
      ) : null}
      <time dateTime={metadata.retrievedAt}>
        {copy.retrieved} {formatDataStateDate(metadata.retrievedAt, locale)}
      </time>
    </div>
  );
}
