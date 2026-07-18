import "server-only";

import { getServerEnv } from "@/lib/env/server";

import { providerPolicies } from "./provider-registry";
import type { ExternalErrorKind, FetchPolicy } from "./types";

export class ExternalRequestError extends Error {
  constructor(
    readonly kind: ExternalErrorKind,
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ExternalRequestError";
  }
}

interface FetchExternalJsonInput {
  readonly path: `/${string}`;
  readonly params?: Readonly<
    Record<string, string | number | boolean | undefined>
  >;
  readonly policy: FetchPolicy;
}

export function buildExternalUrl({
  path,
  params,
  policy,
}: FetchExternalJsonInput): URL {
  const provider = providerPolicies[policy.providerId];
  const url = new URL(path, provider.origin);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  if (provider.authentication === "nasa-api-key") {
    const apiKey = getServerEnv().NASA_API_KEY;
    if (!apiKey) {
      throw new ExternalRequestError(
        "configuration",
        `${provider.name} requires NASA_API_KEY.`,
      );
    }
    url.searchParams.set("api_key", apiKey);
  }
  return url;
}

export async function fetchExternalJson(
  input: FetchExternalJsonInput,
): Promise<unknown> {
  const url = buildExternalUrl(input);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: input.policy.revalidateSeconds,
        tags: [input.policy.cacheTag],
      },
      signal: AbortSignal.timeout(input.policy.timeoutMs),
    });
  } catch (error) {
    const timeout =
      error instanceof DOMException && error.name === "TimeoutError";
    throw new ExternalRequestError(
      timeout ? "timeout" : "network",
      timeout ? "External request timed out." : "External request failed.",
      undefined,
      { cause: error },
    );
  }

  const statusKinds: Partial<Record<number, ExternalErrorKind>> = {
    401: "unauthorized",
    403: "forbidden",
    429: "rate-limit",
  };
  if (!response.ok) {
    throw new ExternalRequestError(
      statusKinds[response.status] ?? "upstream",
      `External provider returned ${response.status}.`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ExternalRequestError(
      "malformed-json",
      "External provider returned malformed JSON.",
      response.status,
      { cause: error },
    );
  }
}
