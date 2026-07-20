import { afterEach, describe, expect, it, vi } from "vitest";
import { Texture, TextureLoader } from "three";

import {
  acquireTexture,
  disposeTextureCache,
  textureCacheSnapshot,
  textureReadinessDetails,
  textureReadinessFor,
} from "./texture-cache";

describe("texture preload readiness", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    disposeTextureCache();
  });

  it("keeps successful surfaces independent from a failed sibling request", async () => {
    const earth = new Texture<HTMLImageElement>();
    vi.spyOn(TextureLoader.prototype, "loadAsync").mockImplementation((path) =>
      path === "/mars.webp"
        ? Promise.reject(new Error("mars unavailable"))
        : Promise.resolve(earth),
    );

    const earthLease = acquireTexture("/earth.webp");
    const marsLease = acquireTexture("/mars.webp");

    await expect(earthLease.promise).resolves.toBe(earth);
    await expect(marsLease.promise).rejects.toThrow("mars unavailable");

    expect(textureReadinessFor("/earth.webp")).toBe("ready");
    expect(textureReadinessFor("/mars.webp")).toBe("error");
    expect(textureReadinessDetails()).toEqual(
      expect.arrayContaining([
        { path: "/earth.webp", references: 1, status: "ready" },
        { path: "/mars.webp", references: 0, status: "error" },
      ]),
    );

    earthLease.release();
    marsLease.release();
  });

  it("shares one cache entry across preload and material leases", async () => {
    const texture = new Texture<HTMLImageElement>();
    const load = vi
      .spyOn(TextureLoader.prototype, "loadAsync")
      .mockResolvedValue(texture);

    const preload = acquireTexture("/earth.webp");
    const material = acquireTexture("/earth.webp");
    await preload.promise;

    expect(load).toHaveBeenCalledTimes(1);
    expect(textureCacheSnapshot()).toEqual([
      { path: "/earth.webp", references: 2 },
    ]);

    preload.release();
    material.release();
  });
});
