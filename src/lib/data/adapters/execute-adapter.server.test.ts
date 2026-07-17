import { describe, expect, it } from "vitest";
import { z } from "zod";

import { executeAdapter } from "./execute-adapter.server";

const rawSchema = z.object({ value: z.number() });

describe("adapter execution", () => {
  it("parses and normalizes a current response", async () => {
    const result = await executeAdapter({
      adapter: {
        id: "test",
        fetch: async () => ({ value: 2 }),
        parse: (raw) => rawSchema.parse(raw),
        normalize: ({ value }) => value * 2,
      },
      input: undefined,
      metadata: () => ({
        freshness: "latest-available",
        provider: "Test provider",
        retrievedAt: "2026-07-17T12:00:00.000Z",
        sourceTitle: "Test source",
        sourceUrl: "https://example.com/source",
      }),
    });

    expect(result.status).toBe("current");
    expect(result.data).toBe(4);
  });

  it("uses a declared fallback when validation fails", async () => {
    const fallback = {
      data: 7,
      metadata: {
        freshness: "historical" as const,
        provider: "Test provider",
        retrievedAt: "2026-07-16T12:00:00.000Z",
        sourceTitle: "Stored snapshot",
        sourceUrl: "https://example.com/source",
      },
      status: "fallback" as const,
    };

    const result = await executeAdapter({
      adapter: {
        id: "test",
        fetch: async () => ({ value: "invalid" }),
        parse: (raw) => rawSchema.parse(raw),
        normalize: ({ value }) => value,
      },
      fallback,
      input: undefined,
      metadata: () => undefined,
    });

    expect(result.status).toBe("fallback");
    expect(result.errorKind).toBe("schema");
    expect(result.data).toBe(7);
  });
});
