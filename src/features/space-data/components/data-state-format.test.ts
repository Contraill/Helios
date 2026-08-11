import { describe, expect, it } from "vitest";

import { formatDataStateDate } from "./data-state-format";

describe("formatDataStateDate", () => {
  it("formats UTC timestamps deterministically in English", () => {
    expect(formatDataStateDate("2026-08-11T17:05:42.000Z", "en")).toBe(
      "Aug 11, 2026, 5:05 PM",
    );
  });

  it("formats UTC timestamps deterministically in Turkish", () => {
    expect(formatDataStateDate("2026-08-11T17:05:42.000Z", "tr")).toBe(
      "11 Ağu 2026 17:05",
    );
  });

  it("formats the JPL CAD calendar contract without Date.parse", () => {
    expect(formatDataStateDate("2028-Jun-26 05:23", "en")).toBe(
      "Jun 26, 2028, 5:23 AM",
    );
    expect(formatDataStateDate("2028-Jun-26 05:23", "tr")).toBe(
      "26 Haz 2028 05:23",
    );
  });

  it("formats the CNEOS fireball calendar contract without Date.parse", () => {
    expect(formatDataStateDate("2015-10-13 12:23:08", "en")).toBe(
      "Oct 13, 2015, 12:23 PM",
    );
    expect(formatDataStateDate("2015-10-13 12:23:08", "tr")).toBe(
      "13 Eki 2015 12:23",
    );
  });

  it("formats date-only GIBS metadata deterministically", () => {
    expect(formatDataStateDate("2026-07-17", "en")).toBe(
      "Jul 17, 2026, 12:00 AM",
    );
  });

  it("preserves unsupported or invalid provider timestamps", () => {
    expect(formatDataStateDate("not-a-date", "en")).toBe("not-a-date");
    expect(formatDataStateDate("2026-02-31T17:05:00.000Z", "en")).toBe(
      "2026-02-31T17:05:00.000Z",
    );
  });
});
