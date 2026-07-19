import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FetchPolicy } from "./types";

const epicPolicy: FetchPolicy = {
  providerId: "epic",
  revalidateSeconds: 60,
  timeoutMs: 500,
  cacheTag: "epic-test",
};

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  delete process.env.NASA_API_KEY;
  delete process.env.NEXT_PUBLIC_NASA_API_KEY;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("external request boundary", () => {
  it("keeps keyless providers free of NASA_API_KEY", async () => {
    const { buildExternalUrl } = await import("./request.server");
    const url = buildExternalUrl({ path: "/api/natural", policy: epicPolicy });

    expect(url.origin).toBe("https://epic.gsfc.nasa.gov");
    expect(url.searchParams.has("api_key")).toBe(false);
  });

  it("requires the key only for api.nasa.gov providers", async () => {
    const { buildExternalUrl, ExternalRequestError } =
      await import("./request.server");
    const apodPolicy: FetchPolicy = {
      providerId: "apod",
      revalidateSeconds: 60,
      timeoutMs: 500,
      cacheTag: "apod-test",
    };

    expect(() =>
      buildExternalUrl({ path: "/planetary/apod", policy: apodPolicy }),
    ).toThrowError(ExternalRequestError);

    process.env.NASA_API_KEY = "server-secret";
    vi.resetModules();
    const moduleWithKey = await import("./request.server");
    const url = moduleWithKey.buildExternalUrl({
      path: "/planetary/apod",
      policy: apodPolicy,
    });
    expect(url.searchParams.get("api_key")).toBe("server-secret");
  });

  for (const [status, kind] of [
    [401, "unauthorized"],
    [403, "forbidden"],
    [429, "rate-limit"],
    [500, "upstream"],
  ] as const) {
    it(`classifies HTTP ${status}`, async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response("{}", {
            status,
            headers: { "content-type": "application/json" },
          }),
        ),
      );
      const { fetchExternalJson } = await import("./request.server");

      await expect(
        fetchExternalJson({ path: "/api/natural", policy: epicPolicy }),
      ).rejects.toMatchObject({ kind, status });
    });
  }

  it("classifies malformed JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("not json", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    const { fetchExternalJson } = await import("./request.server");

    await expect(
      fetchExternalJson({ path: "/api/natural", policy: epicPolicy }),
    ).rejects.toMatchObject({ kind: "malformed-json" });
  });

  it("classifies network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("dns")));
    const { fetchExternalJson } = await import("./request.server");

    await expect(
      fetchExternalJson({ path: "/api/natural", policy: epicPolicy }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("can bypass the Next fetch cache for oversized provider documents", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("<xml />"));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchExternalText } = await import("./request.server");

    await fetchExternalText({
      cacheMode: "no-store",
      path: "/capabilities.xml",
      policy: epicPolicy,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("next");
  });
});
