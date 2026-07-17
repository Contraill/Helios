import type { ObservationMetadata } from "@/lib/data/schemas/observation";

export interface ExternalDataAdapter<TInput, TRaw, TNormalized> {
  readonly id: string;
  fetch(input: TInput): Promise<unknown>;
  normalize(raw: TRaw): TNormalized;
  parse(raw: unknown): TRaw;
}

export type AdapterAvailability =
  "current" | "stale" | "fallback" | "unavailable";

export interface AdapterSnapshot<T> {
  readonly data: T;
  readonly metadata: ObservationMetadata;
  readonly status: "stale" | "fallback";
}

export interface AdapterResult<T> {
  readonly data: T | null;
  readonly errorKind?: AdapterErrorKind;
  readonly metadata?: ObservationMetadata;
  readonly status: AdapterAvailability;
}

export type AdapterErrorKind =
  | "configuration"
  | "network"
  | "rate-limit"
  | "schema"
  | "timeout"
  | "upstream";
