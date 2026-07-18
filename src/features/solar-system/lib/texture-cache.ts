"use client";

import { useEffect, useState } from "react";
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

interface TextureCacheEntry {
  disposeTimer: ReturnType<typeof setTimeout> | null;
  expired: boolean;
  promise: Promise<Texture>;
  references: number;
  texture: Texture | null;
}

export interface TextureLease {
  readonly promise: Promise<Texture>;
  release: () => void;
}

const DISPOSE_DELAY_MS = 5_000;
const textureCache = new Map<string, TextureCacheEntry>();

function disposeLoadedTexture(texture: Texture): void {
  texture.dispose();
  const image = texture.image as { close?: () => void } | null | undefined;
  image?.close?.();
  texture.image = null;
}

function loadTexture(path: string): Promise<Texture> {
  return new TextureLoader().loadAsync(path).then((texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.name = `helios:${path}`;
    return texture;
  });
}

export function acquireTexture(path: string): TextureLease {
  let entry = textureCache.get(path);

  if (!entry) {
    const nextEntry: TextureCacheEntry = {
      disposeTimer: null,
      expired: false,
      promise: Promise.resolve(null as unknown as Texture),
      references: 0,
      texture: null,
    };
    nextEntry.promise = loadTexture(path)
      .then((texture) => {
        nextEntry.texture = texture;
        if (nextEntry.expired) disposeLoadedTexture(texture);
        return texture;
      })
      .catch((error: unknown) => {
        if (textureCache.get(path) === nextEntry) textureCache.delete(path);
        throw error;
      });
    entry = nextEntry;
    textureCache.set(path, entry);
  }

  entry.references += 1;
  if (entry.disposeTimer) {
    clearTimeout(entry.disposeTimer);
    entry.disposeTimer = null;
  }

  let released = false;
  return {
    promise: entry.promise,
    release: () => {
      if (released) return;
      released = true;
      entry.references = Math.max(0, entry.references - 1);
      if (entry.references > 0) return;

      entry.disposeTimer = setTimeout(() => {
        if (entry.references > 0) return;
        entry.expired = true;
        if (entry.texture) disposeLoadedTexture(entry.texture);
        entry.texture = null;
        if (textureCache.get(path) === entry) textureCache.delete(path);
      }, DISPOSE_DELAY_MS);
    },
  };
}

export function useSceneTexture(path: string): Texture | null {
  const [loaded, setLoaded] = useState<{
    path: string;
    texture: Texture;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const lease = acquireTexture(path);

    void lease.promise.then(
      (loadedTexture) => {
        if (active) setLoaded({ path, texture: loadedTexture });
      },
      () => {
        if (active) setLoaded(null);
      },
    );

    return () => {
      active = false;
      lease.release();
    };
  }, [path]);

  return loaded?.path === path ? loaded.texture : null;
}

export function textureCacheSnapshot(): readonly {
  path: string;
  references: number;
}[] {
  return [...textureCache.entries()].map(([path, entry]) => ({
    path,
    references: entry.references,
  }));
}

export function disposeTextureCache(): void {
  for (const entry of textureCache.values()) {
    if (entry.disposeTimer) clearTimeout(entry.disposeTimer);
    entry.expired = true;
    if (entry.texture) disposeLoadedTexture(entry.texture);
    entry.texture = null;
  }
  textureCache.clear();
}
