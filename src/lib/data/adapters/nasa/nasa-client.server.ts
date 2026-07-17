import "server-only";

import { getServerEnv } from "@/lib/env/server";

import { DataAdapterError } from "../errors";
import { buildNasaUrl } from "./nasa-request";

export interface NasaFetchPolicy {
  readonly cacheTag: string;
  readonly revalidateSeconds: number;
  readonly timeoutMs: number;
}

interface FetchNasaJsonInput {
  readonly params?: Readonly<Record<string, string | number | boolean>>;
  readonly path: `/${string}`;
  readonly policy: NasaFetchPolicy;
}

export async function fetchNasaJson({
  params,
  path,
  policy,
}: FetchNasaJsonInput): Promise<unknown> {
  const apiKey = getServerEnv().NASA_API_KEY;
  if (!apiKey) {
    throw new DataAdapterError(
      "configuration",
      "NASA_API_KEY is required before a NASA adapter can run.",
    );
  }

  const url = buildNasaUrl({ apiKey, params, path });

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: policy.revalidateSeconds,
        tags: [policy.cacheTag],
      },
      signal: AbortSignal.timeout(policy.timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new DataAdapterError("timeout", "NASA request timed out.", {
        cause: error,
      });
    }
    throw new DataAdapterError("network", "NASA request failed.", {
      cause: error,
    });
  }

  if (response.status === 429) {
    throw new DataAdapterError("rate-limit", "NASA rate limit exceeded.", {
      statusCode: response.status,
    });
  }

  if (!response.ok) {
    throw new DataAdapterError("upstream", "NASA returned an error response.", {
      statusCode: response.status,
    });
  }

  try {
    return await response.json();
  } catch (error) {
    throw new DataAdapterError("schema", "NASA returned invalid JSON.", {
      cause: error,
    });
  }
}
