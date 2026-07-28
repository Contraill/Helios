"use client";

import type {
  ExternalDataStatus,
  ExternalMetadata,
} from "@/lib/data/external/types";
import { localeTag } from "@/lib/i18n/locale";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "./space-data.module.css";

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
      data-status={status}
    >
      <span className={styles.stateLabel}>{copy.labels[status]}</span>
      <span>{metadata.provider}</span>
      {metadata.observedAt ? (
        <time dateTime={metadata.observedAt}>
          {copy.observed} {formatDate(metadata.observedAt, localeTag(locale))}
        </time>
      ) : null}
      <time dateTime={metadata.retrievedAt}>
        {copy.retrieved} {formatDate(metadata.retrievedAt, localeTag(locale))}
      </time>
    </div>
  );
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}
