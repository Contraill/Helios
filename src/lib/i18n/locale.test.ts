import { describe, expect, it } from "vitest";

import { formatSourceDate } from "./formatters";
import { landingCopy } from "./landing-copy";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeTag,
  localizedPath,
  resolveLocale,
  stripLocalePrefix,
  SUPPORTED_LOCALES,
} from "./locale";
import { siteCopy } from "./site-copy";

function sortedKeys(value: object): string[] {
  return Object.keys(value).sort();
}

describe("locale contract", () => {
  it("accepts only the supported locales and falls back deterministically", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "tr"]);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(resolveLocale("tr")).toBe("tr");
    expect(resolveLocale("invalid")).toBe(DEFAULT_LOCALE);
    expect(localeTag("en")).toBe("en-US");
    expect(localeTag("tr")).toBe("tr-TR");
  });

  it("maps internal paths into and out of the locale URL space", () => {
    expect(localizedPath("/body/mars", "en")).toBe("/body/mars");
    expect(localizedPath("/body/mars", "tr")).toBe("/tr/body/mars");
    expect(localizedPath("/", "tr")).toBe("/tr");
    expect(localizedPath("/?at=2026", "tr")).toBe("/tr?at=2026");
    expect(localizedPath("#sources", "tr")).toBe("#sources");
    expect(stripLocalePrefix("/tr/body/mars")).toBe("/body/mars");
    expect(stripLocalePrefix("/tr")).toBe("/");
    expect(stripLocalePrefix("/body/mars")).toBe("/body/mars");
    expect(stripLocalePrefix("/trails")).toBe("/trails");
  });

  it("formats source dates without inventing day-level precision", () => {
    expect(formatSourceDate("2026-07-17", "en")).toBe("Jul 17, 2026");
    expect(formatSourceDate("2026-07-17", "tr")).toBe("17 Tem 2026");
    expect(formatSourceDate("2026-07", "en")).toBe("July 2026");
    expect(formatSourceDate("2026-07", "tr")).toBe("Temmuz 2026");
    expect(formatSourceDate("reference", "tr")).toBe("reference");
  });

  it("keeps the global and landing dictionaries structurally aligned", () => {
    expect(sortedKeys(siteCopy.tr)).toEqual(sortedKeys(siteCopy.en));
    expect(sortedKeys(siteCopy.tr.nav)).toEqual(sortedKeys(siteCopy.en.nav));
    expect(sortedKeys(siteCopy.tr.a11y)).toEqual(sortedKeys(siteCopy.en.a11y));
    expect(sortedKeys(landingCopy.tr)).toEqual(sortedKeys(landingCopy.en));
    expect(sortedKeys(landingCopy.tr.home)).toEqual(
      sortedKeys(landingCopy.en.home),
    );
    expect(sortedKeys(landingCopy.tr.missions)).toEqual(
      sortedKeys(landingCopy.en.missions),
    );
  });
});
