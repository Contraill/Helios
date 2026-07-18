import { describe, expect, it } from "vitest";

import { requestedDateFrom } from "./route";

describe("ephemeris API date boundary", () => {
  it("accepts a bounded ISO instant", () => {
    expect(requestedDateFrom("2026-07-18T12:30:00.000Z")?.toISOString()).toBe(
      "2026-07-18T12:30:00.000Z",
    );
  });

  it("rejects missing, malformed and out-of-range dates", () => {
    expect(requestedDateFrom(null)).toBeNull();
    expect(requestedDateFrom("not-a-date")).toBeNull();
    expect(requestedDateFrom("1899-12-31T23:59:59.000Z")).toBeNull();
    expect(requestedDateFrom("2101-01-01T00:00:00.000Z")).toBeNull();
  });
});
