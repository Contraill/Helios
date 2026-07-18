import type {
  ExternalDataStatus,
  ExternalMetadata,
} from "@/lib/data/external/types";

import styles from "./space-data.module.css";

const labels: Record<ExternalDataStatus, string> = {
  current: "Current response",
  "near-live": "Near-live source",
  "latest-available": "Latest available",
  historical: "Historical record",
  partial: "Partial provider response",
  stale: "Cached record",
  fallback: "Verified fallback",
  unavailable: "Unavailable",
};

export function DataState({
  status,
  metadata,
  compact = false,
}: {
  readonly status: ExternalDataStatus;
  readonly metadata: ExternalMetadata;
  readonly compact?: boolean;
}) {
  return (
    <div
      className={compact ? styles.stateCompact : styles.state}
      data-status={status}
    >
      <span className={styles.stateLabel}>{labels[status]}</span>
      <span>{metadata.provider}</span>
      {metadata.observedAt ? (
        <time dateTime={metadata.observedAt}>
          Observed {formatDate(metadata.observedAt)}
        </time>
      ) : null}
      <time dateTime={metadata.retrievedAt}>
        Retrieved {formatDate(metadata.retrievedAt)}
      </time>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}
