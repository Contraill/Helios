import { describe, expect, it } from "vitest";

import type { ExternalResult } from "./types";
import { preferFreshestResult } from "./prefer-result";

function result(
  status: ExternalResult<readonly string[]>["status"],
  provider: string,
  data: readonly string[] | null = [provider],
): ExternalResult<readonly string[]> {
  return {
    data,
    status,
    metadata: {
      provider,
      sourceTitle: provider,
      sourceUrl: "https://example.com",
      freshness: "latest-available",
      retrievedAt: "2026-07-18T00:00:00.000Z",
      attribution: provider,
    },
  };
}

describe("preferFreshestResult", () => {
  it("does not let a populated stale fallback replace current provider data", () => {
    const staleCad = result("stale", "JPL CNEOS");
    const currentNeows = result("latest-available", "NASA NeoWs");

    expect(preferFreshestResult(staleCad, currentNeows)).toBe(currentNeows);
  });

  it("prefers usable fallback data over an unavailable empty response", () => {
    const unavailable = result("unavailable", "A", null);
    const fallback = result("fallback", "B");

    expect(preferFreshestResult(unavailable, fallback)).toBe(fallback);
  });
});
