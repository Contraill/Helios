import type { DataFreshness } from "@/lib/data/schemas/source";

export type ExternalDataStatus =
  | "current"
  | "near-live"
  | "latest-available"
  | "historical"
  | "stale"
  | "fallback"
  | "unavailable";

export type ExternalErrorKind =
  | "configuration"
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "rate-limit"
  | "upstream"
  | "malformed-json"
  | "schema"
  | "empty"
  | "version";

export interface ExternalMetadata {
  readonly provider: string;
  readonly sourceTitle: string;
  readonly sourceUrl: string;
  readonly freshness: DataFreshness;
  readonly observedAt?: string;
  readonly retrievedAt: string;
  readonly attribution: string;
  readonly notes?: string;
}

export interface ExternalResult<T> {
  readonly data: T | null;
  readonly status: ExternalDataStatus;
  readonly metadata: ExternalMetadata;
  readonly errorKind?: ExternalErrorKind;
}

export interface VerifiedSnapshot<T> {
  readonly schemaVersion: 1;
  readonly purpose: string;
  readonly data: T;
  readonly metadata: ExternalMetadata;
  readonly fallbackStatus?: Extract<
    ExternalDataStatus,
    "historical" | "stale" | "fallback"
  >;
}

export interface FetchPolicy {
  readonly providerId: ProviderId;
  readonly revalidateSeconds: number;
  readonly timeoutMs: number;
  readonly cacheTag: string;
}

export type ProviderId =
  | "apod"
  | "donki"
  | "neows"
  | "insight"
  | "epic"
  | "eonet"
  | "gibs"
  | "nasa-images"
  | "mars-trek"
  | "mercury-trek"
  | "cneos-cad"
  | "cneos-fireball";
