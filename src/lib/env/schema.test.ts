import { describe, expect, it } from "vitest";

import { EnvValidationError, parseServerEnv } from "./schema";

function messageFor(raw: Record<string, string | undefined>): string {
  try {
    parseServerEnv(raw);
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

describe("parseServerEnv", () => {
  it("accepts an environment without a NASA key while external services are optional", () => {
    expect(parseServerEnv({ NODE_ENV: "test" })).toEqual({ NODE_ENV: "test" });
  });

  it("accepts an absolute server-only SITE_URL", () => {
    expect(parseServerEnv({ SITE_URL: "https://example.com" }).SITE_URL).toBe(
      "https://example.com",
    );
  });

  it("rejects a relative, non-web or non-origin SITE_URL", () => {
    expect(messageFor({ SITE_URL: "/helios" })).toMatch(/SITE_URL/);
    expect(messageFor({ SITE_URL: "ftp://example.com" })).toMatch(
      /http or https/,
    );
    expect(messageFor({ SITE_URL: "https://example.com/helios" })).toMatch(
      /origin/,
    );
  });

  it("accepts a non-empty NASA_API_KEY", () => {
    const env = parseServerEnv({ NASA_API_KEY: "example-key" });
    expect(env.NASA_API_KEY).toBe("example-key");
  });

  it("rejects an empty NASA_API_KEY with a readable, named message", () => {
    expect(() => parseServerEnv({ NASA_API_KEY: "" })).toThrowError(
      EnvValidationError,
    );
    expect(messageFor({ NASA_API_KEY: "" })).toMatch(/NASA_API_KEY/);
  });

  it("rejects NEXT_PUBLIC_NASA_API_KEY to keep the key server-only", () => {
    expect(messageFor({ NEXT_PUBLIC_NASA_API_KEY: "anything" })).toMatch(
      /NEXT_PUBLIC_NASA_API_KEY/,
    );
  });

  it("never echoes secret values in error messages", () => {
    const message = messageFor({
      NEXT_PUBLIC_NASA_API_KEY: "super-secret-123",
    });
    expect(message).not.toContain("super-secret-123");
  });
});
