import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Texture, TextureLoader } from "three";

import {
  acquireTexture,
  clearTextureFailure,
  disposeTextureCache,
  textureCacheSnapshot,
  textureDisposalCount,
  textureMaterialKey,
  textureReadinessDetails,
  textureReadinessFor,
  useSceneTexture,
} from "./texture-cache";

describe("scene texture cache", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    disposeTextureCache();
  });

  it("changes the material key when a delayed texture becomes available", () => {
    const texture = new Texture();
    expect(textureMaterialKey(null)).toBe("texture:fallback");
    expect(textureMaterialKey(texture)).toBe(`texture:${texture.uuid}`);
  });

  it("shares one network load and disposes only after the final delayed release", async () => {
    vi.useFakeTimers();
    const texture = new Texture<HTMLImageElement>(
      document.createElement("img"),
    );
    const dispose = vi.spyOn(texture, "dispose");
    const load = vi
      .spyOn(TextureLoader.prototype, "loadAsync")
      .mockResolvedValue(texture);
    const first = acquireTexture("/shared.webp");
    const second = acquireTexture("/shared.webp");
    await first.promise;
    expect(load).toHaveBeenCalledTimes(1);
    expect(textureCacheSnapshot()).toEqual([
      { path: "/shared.webp", references: 2 },
    ]);

    first.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(dispose).not.toHaveBeenCalled();
    second.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(dispose).toHaveBeenCalledOnce();
    expect(textureDisposalCount()).toBe(1);
    expect(texture.image).toBeNull();
  });

  it("tracks sibling readiness independently when one asset fails", async () => {
    const earth = new Texture<HTMLImageElement>(document.createElement("img"));
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

  it("pins one failed request until a deliberate retry", async () => {
    const texture = new Texture<HTMLImageElement>(
      document.createElement("img"),
    );
    const load = vi
      .spyOn(TextureLoader.prototype, "loadAsync")
      .mockRejectedValueOnce(new Error("texture unavailable"))
      .mockResolvedValueOnce(texture);
    const failed = acquireTexture("/retry.webp");
    await expect(failed.promise).rejects.toThrow("texture unavailable");
    failed.release();
    clearTextureFailure("/retry.webp");
    const retry = acquireTexture("/retry.webp");
    await expect(retry.promise).resolves.toBe(texture);
    expect(load).toHaveBeenCalledTimes(2);
    retry.release();
  });

  it("retains the previous successful map until the next quality variant is ready", async () => {
    const mediumTexture = new Texture<HTMLImageElement>(
      document.createElement("img"),
    );
    const highTexture = new Texture<HTMLImageElement>(
      document.createElement("img"),
    );
    let resolveMedium!: (value: Texture<HTMLImageElement>) => void;
    let resolveHigh!: (value: Texture<HTMLImageElement>) => void;
    vi.spyOn(TextureLoader.prototype, "loadAsync").mockImplementation(
      (path) =>
        new Promise<Texture<HTMLImageElement>>((resolve) => {
          if (path === "/planet-medium.webp") resolveMedium = resolve;
          else resolveHigh = resolve;
        }),
    );
    const { result, rerender, unmount } = renderHook(
      ({ path }) => useSceneTexture(path),
      { initialProps: { path: "/planet-medium.webp" } },
    );
    await act(async () => resolveMedium(mediumTexture));
    expect(result.current).toBe(mediumTexture);
    rerender({ path: "/planet-high.webp" });
    expect(result.current).toBe(mediumTexture);
    await act(async () => resolveHigh(highTexture));
    expect(result.current).toBe(highTexture);
    expect(textureCacheSnapshot()).toEqual(
      expect.arrayContaining([
        { path: "/planet-medium.webp", references: 0 },
        { path: "/planet-high.webp", references: 1 },
      ]),
    );
    unmount();
  });
});
