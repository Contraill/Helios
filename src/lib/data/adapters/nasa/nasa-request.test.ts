import { describe, expect, it } from "vitest";

import { buildNasaUrl } from "./nasa-request";

describe("NASA request builder", () => {
  it("builds an allowlisted NASA origin URL without losing parameters", () => {
    const url = buildNasaUrl({
      apiKey: "test-key",
      path: "/planetary/apod",
      params: { date: "2026-07-17", thumbs: true },
    });

    expect(url.origin).toBe("https://api.nasa.gov");
    expect(url.pathname).toBe("/planetary/apod");
    expect(url.searchParams.get("api_key")).toBe("test-key");
    expect(url.searchParams.get("date")).toBe("2026-07-17");
    expect(url.searchParams.get("thumbs")).toBe("true");
  });

  it("rejects missing keys", () => {
    expect(() => buildNasaUrl({ apiKey: "", path: "/planetary/apod" })).toThrow(
      "NASA API key is required",
    );
  });
});
