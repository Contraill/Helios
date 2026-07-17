import "server-only";

import { ZodError } from "zod";

import { DataAdapterError } from "./errors";
import type {
  AdapterResult,
  AdapterSnapshot,
  ExternalDataAdapter,
} from "./types";

interface ExecuteAdapterOptions<TInput, TRaw, TNormalized> {
  adapter: ExternalDataAdapter<TInput, TRaw, TNormalized>;
  fallback?: AdapterSnapshot<TNormalized>;
  input: TInput;
  metadata: (normalized: TNormalized) => AdapterResult<TNormalized>["metadata"];
}

function toErrorKind(error: unknown): AdapterResult<never>["errorKind"] {
  if (error instanceof DataAdapterError) return error.kind;
  if (error instanceof ZodError) return "schema";
  return "upstream";
}

export async function executeAdapter<TInput, TRaw, TNormalized>({
  adapter,
  fallback,
  input,
  metadata,
}: ExecuteAdapterOptions<TInput, TRaw, TNormalized>): Promise<
  AdapterResult<TNormalized>
> {
  try {
    const unknownPayload = await adapter.fetch(input);
    const parsed = adapter.parse(unknownPayload);
    const normalized = adapter.normalize(parsed);

    return {
      data: normalized,
      metadata: metadata(normalized),
      status: "current",
    };
  } catch (error) {
    if (fallback) {
      return {
        data: fallback.data,
        errorKind: toErrorKind(error),
        metadata: fallback.metadata,
        status: fallback.status,
      };
    }

    return {
      data: null,
      errorKind: toErrorKind(error),
      status: "unavailable",
    };
  }
}
