// @vitest-environment node
import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok with a valid timestamp", async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
      timestamp: string;
    };
    expect(body.status).toBe("ok");
    expect(Number.isNaN(new Date(body.timestamp).getTime())).toBe(false);
  });
});
