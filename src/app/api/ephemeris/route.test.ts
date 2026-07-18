import { describe, expect, it } from "vitest";

import { createSimulationRange } from "@/features/solar-system/lib/simulation-range";

import { requestedDateFrom, requestRangeFrom } from "./route";

describe("ephemeris API date boundary", () => {
  const anchor = Date.parse("2026-07-18T12:30:00.000Z");
  const range = createSimulationRange(anchor);

  it("accepts the exact dynamic minimum and maximum", () => {
    expect(
      requestedDateFrom("1526-07-18T12:30:00.000Z", range)?.toISOString(),
    ).toBe("1526-07-18T12:30:00.000Z");
    expect(
      requestedDateFrom("2626-07-18T12:30:00.000Z", range)?.toISOString(),
    ).toBe("2626-07-18T12:30:00.000Z");
  });

  it("rejects missing, malformed and one millisecond out-of-range dates", () => {
    expect(requestedDateFrom(null, range)).toBeNull();
    expect(requestedDateFrom("not-a-date", range)).toBeNull();
    expect(
      requestedDateFrom(new Date(range.minimumUtcMs - 1).toISOString(), range),
    ).toBeNull();
    expect(
      requestedDateFrom(new Date(range.maximumUtcMs + 1).toISOString(), range),
    ).toBeNull();
  });

  it("uses a current client anchor but rejects an arbitrarily shifted one", () => {
    expect(
      requestRangeFrom("2026-07-18T12:30:00.000Z", anchor).anchorUtcMs,
    ).toBe(anchor);
    expect(
      requestRangeFrom("2020-01-01T00:00:00.000Z", anchor).anchorUtcMs,
    ).toBe(anchor);
  });
});
