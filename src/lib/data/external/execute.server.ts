import "server-only";

import { ZodError } from "zod";

import { ExternalRequestError } from "./request.server";
import type {
  ExternalErrorKind,
  ExternalMetadata,
  ExternalResult,
  VerifiedSnapshot,
} from "./types";

interface ExecuteExternalOptions<T> {
  readonly fetchCurrent: () => Promise<T>;
  readonly metadata: (data: T) => ExternalMetadata;
  readonly snapshot?: VerifiedSnapshot<T>;
  readonly empty: (data: T) => boolean;
  readonly currentStatus?: ExternalResult<T>["status"];
  readonly allowNetworkDuringBuild?: boolean;
}

function errorKind(error: unknown): ExternalErrorKind {
  if (error instanceof ExternalRequestError) return error.kind;
  if (error instanceof ZodError) return "schema";
  return "upstream";
}

export function isProductionBuild(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.HELIOS_BUILD_MODE === "snapshot"
  );
}

export async function executeExternal<T>({
  fetchCurrent,
  metadata,
  snapshot,
  empty,
  currentStatus = "current",
  allowNetworkDuringBuild = false,
}: ExecuteExternalOptions<T>): Promise<ExternalResult<T>> {
  try {
    if (isProductionBuild() && !allowNetworkDuringBuild) {
      throw new ExternalRequestError(
        "network",
        "Static generation uses the verified snapshot boundary.",
      );
    }
    const data = await fetchCurrent();
    if (empty(data)) {
      throw new ExternalRequestError(
        "empty",
        "Provider returned no usable records.",
      );
    }
    return { data, status: currentStatus, metadata: metadata(data) };
  } catch (error) {
    if (snapshot) {
      return {
        data: snapshot.data,
        status:
          snapshot.fallbackStatus ??
          (snapshot.metadata.freshness === "historical"
            ? "historical"
            : "fallback"),
        metadata: snapshot.metadata,
        errorKind: errorKind(error),
      };
    }
    return {
      data: null,
      status: "unavailable",
      errorKind: errorKind(error),
      metadata: {
        provider: "External provider",
        sourceTitle: "Provider unavailable",
        sourceUrl: "https://science.nasa.gov/",
        freshness: "reference",
        retrievedAt: new Date().toISOString(),
        attribution: "No external record is displayed.",
      },
    };
  }
}
