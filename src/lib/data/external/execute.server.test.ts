import { describe, expect, it } from "vitest";
import { z } from "zod";

import { executeExternal } from "./execute.server";
import type { ExternalMetadata, VerifiedSnapshot } from "./types";

const metadata: ExternalMetadata = {
  provider: "Test provider",
  sourceTitle: "Test source",
  sourceUrl: "https://example.com/source",
  freshness: "latest-available",
  observedAt: "2026-07-17T00:00:00.000Z",
  retrievedAt: "2026-07-18T00:00:00.000Z",
  attribution: "Test provider",
};
const snapshot: VerifiedSnapshot<readonly string[]> = {
  schemaVersion: 1,
  purpose: "test fallback",
  data: ["snapshot"],
  metadata,
  fallbackStatus: "stale",
};

describe("external result fallback chain", () => {
  it("returns a current normalized response", async () => {
    const result = await executeExternal({
      fetchCurrent: async () => ["current"],
      metadata: () => metadata,
      empty: (data) => data.length === 0,
      allowNetworkDuringBuild: true,
    });
    expect(result).toMatchObject({ status: "current", data: ["current"] });
  });

  it("uses a stale verified snapshot for an empty response", async () => {
    const result = await executeExternal({
      fetchCurrent: async () => [],
      metadata: () => metadata,
      empty: (data) => data.length === 0,
      snapshot,
      allowNetworkDuringBuild: true,
    });
    expect(result).toMatchObject({
      status: "stale",
      data: ["snapshot"],
      errorKind: "empty",
    });
  });

  it("uses a snapshot after schema mismatch", async () => {
    const result = await executeExternal({
      fetchCurrent: async () => {
        z.object({ id: z.string() }).parse({ id: 4 });
        return ["unreachable"];
      },
      metadata: () => metadata,
      empty: () => false,
      snapshot: { ...snapshot, data: ["schema fallback"] },
      allowNetworkDuringBuild: true,
    });
    expect(result).toMatchObject({
      status: "stale",
      data: ["schema fallback"],
      errorKind: "schema",
    });
  });

  it("returns unavailable when no fallback exists", async () => {
    const result = await executeExternal<readonly string[]>({
      fetchCurrent: async () => {
        throw new Error("provider down");
      },
      metadata: () => metadata,
      empty: (data) => data.length === 0,
      allowNetworkDuringBuild: true,
    });
    expect(result.status).toBe("unavailable");
    expect(result.data).toBeNull();
  });
});
