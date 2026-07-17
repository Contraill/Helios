import { describe, expect, it } from "vitest";

import { createStarPositions } from "./star-field";

describe("star field", () => {
  it("creates deterministic finite positions", () => {
    const first = createStarPositions(12, 7);
    const second = createStarPositions(12, 7);
    expect(first).toEqual(second);
    expect(first).toHaveLength(36);
    expect(Array.from(first).every(Number.isFinite)).toBe(true);
  });

  it("rejects invalid counts", () => {
    expect(() => createStarPositions(-1)).toThrow(RangeError);
    expect(() => createStarPositions(1.5)).toThrow(RangeError);
  });
});
