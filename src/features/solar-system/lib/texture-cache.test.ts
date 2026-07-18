import { afterEach, describe, expect, it, vi } from "vitest";
import { Texture, TextureLoader } from "three";

import {
  acquireTexture,
  disposeTextureCache,
  textureCacheSnapshot,
} from "./texture-cache";

describe("scene texture cache", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    disposeTextureCache();
  });

  it("shares one load and disposes only after the final delayed release", async () => {
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
    await vi.advanceTimersByTimeAsync(4_999);
    expect(dispose).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(dispose).toHaveBeenCalledOnce();
    expect(texture.image).toBeNull();
    expect(textureCacheSnapshot()).toEqual([]);
  });

  it("disposes a late load after its unreferenced cache entry expires", async () => {
    vi.useFakeTimers();
    const texture = new Texture<HTMLImageElement>(
      document.createElement("img"),
    );
    const dispose = vi.spyOn(texture, "dispose");
    let resolveTexture!: (value: Texture<HTMLImageElement>) => void;
    const pending = new Promise<Texture<HTMLImageElement>>((resolve) => {
      resolveTexture = resolve;
    });
    vi.spyOn(TextureLoader.prototype, "loadAsync").mockReturnValue(pending);

    const lease = acquireTexture("/slow.webp");
    lease.release();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(textureCacheSnapshot()).toEqual([]);

    resolveTexture(texture);
    await lease.promise;
    expect(dispose).toHaveBeenCalledOnce();
    expect(texture.image).toBeNull();
  });

  it("evicts a failed request so a later render can retry", async () => {
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
    expect(textureCacheSnapshot()).toEqual([]);

    const retry = acquireTexture("/retry.webp");
    await expect(retry.promise).resolves.toBe(texture);
    expect(load).toHaveBeenCalledTimes(2);
    retry.release();
  });
});
