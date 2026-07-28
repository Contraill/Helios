import { describe, expect, it } from "vitest";

import { absoluteSiteUrl, resolveSiteUrl } from "./site-url";

describe("site URL metadata", () => {
  it("prefers the explicit server-only site URL", () => {
    expect(
      resolveSiteUrl({
        SITE_URL: "https://example.com",
        VERCEL_PROJECT_PRODUCTION_URL: "ignored.vercel.app",
      }).toString(),
    ).toBe("https://example.com/");
  });

  it("uses the stable Vercel production host when configured", () => {
    expect(
      resolveSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "helios-production.vercel.app",
      }).toString(),
    ).toBe("https://helios-production.vercel.app/");
  });

  it("rejects non-web protocols and non-origin values", () => {
    expect(() => resolveSiteUrl({ SITE_URL: "ftp://example.com" })).toThrow(
      /http or https/,
    );
    expect(() =>
      resolveSiteUrl({ SITE_URL: "https://example.com/helios" }),
    ).toThrow(/origin/);
  });

  it("builds absolute canonical destinations without dropping the origin", () => {
    expect(
      absoluteSiteUrl("/body/sun", { SITE_URL: "https://example.com" }),
    ).toBe("https://example.com/body/sun");
  });
});
