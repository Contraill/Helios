"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
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

export type TextureReadiness = "idle" | "loading" | "ready" | "error";

export interface TextureLease {
  readonly promise: Promise<Texture>;
  release: () => void;
}

const DISPOSE_DELAY_MS = 5_000;
const textureCache = new Map<string, TextureCacheEntry>();
const failedTextureLoads = new Map<string, unknown>();
const textureReadiness = new Map<string, TextureReadiness>();
const readinessListeners = new Set<() => void>();
let readinessVersion = 0;
let disposedTextureCount = 0;

function emitReadiness(): void {
  readinessVersion += 1;
  for (const listener of readinessListeners) listener();
}

function setReadiness(path: string, readiness: TextureReadiness): void {
  if (textureReadiness.get(path) === readiness) return;
  textureReadiness.set(path, readiness);
  emitReadiness();
}

export function subscribeTextureReadiness(listener: () => void): () => void {
  readinessListeners.add(listener);
  return () => readinessListeners.delete(listener);
}

export function textureReadinessSnapshot(): ReadonlyMap<
  string,
  TextureReadiness
> {
  return new Map(textureReadiness);
}

export function textureReadinessVersion(): number {
  return readinessVersion;
}

export function textureReadinessFor(path: string): TextureReadiness {
  return textureReadiness.get(path) ?? "idle";
}

function disposeLoadedTexture(texture: Texture): void {
  texture.dispose();
  disposedTextureCount += 1;
  const image = texture.image as { close?: () => void } | null | undefined;
  image?.close?.();
  texture.image = null;
}

function loadTexture(path: string): Promise<Texture> {
  setReadiness(path, "loading");
  return new TextureLoader().loadAsync(path).then((texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
    texture.wrapS = path.includes("/textures/rings/")
      ? ClampToEdgeWrapping
      : RepeatWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.name = `helios:${path}`;
    setReadiness(path, "ready");
    return texture;
  });
}

export function clearTextureFailure(path: string): void {
  if (!failedTextureLoads.delete(path)) return;
  if (!textureCache.has(path)) setReadiness(path, "idle");
}

export function acquireTexture(path: string): TextureLease {
  if (failedTextureLoads.has(path)) {
    const error = failedTextureLoads.get(path);
    return {
      promise: Promise.reject(error),
      release: () => undefined,
    };
  }

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
        failedTextureLoads.delete(path);
        nextEntry.texture = texture;
        if (nextEntry.expired) {
          disposeLoadedTexture(texture);
          setReadiness(path, "idle");
        }
        return texture;
      })
      .catch((error: unknown) => {
        // Pin one settled failure for this asset until an explicit retry. The
        // preloader and mounted material can subscribe in either order without
        // converting one object-level fallback into duplicate network attempts.
        failedTextureLoads.set(path, error);
        setReadiness(path, "error");
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
        if (textureReadiness.get(path) === "ready") setReadiness(path, "idle");
      }, DISPOSE_DELAY_MS);
    },
  };
}

export interface SceneTextureOptions {
  readonly onError?: (error: unknown, path: string) => void;
  readonly onReady?: (path: string, texture: Texture) => void;
}

export function useSceneTexture(
  path: string,
  options: SceneTextureOptions = {},
): Texture | null {
  const retainedLease = useRef<TextureLease | null>(null);
  const onErrorRef = useRef(options.onError);
  const onReadyRef = useRef(options.onReady);
  const [loaded, setLoaded] = useState<{
    path: string;
    texture: Texture;
  } | null>(null);

  useEffect(() => {
    onErrorRef.current = options.onError;
    onReadyRef.current = options.onReady;
  }, [options.onError, options.onReady]);

  useEffect(() => {
    let active = true;
    const candidateLease = acquireTexture(path);

    void candidateLease.promise.then(
      (loadedTexture) => {
        if (!active) return;

        const previousLease = retainedLease.current;
        retainedLease.current = candidateLease;
        setLoaded({ path, texture: loadedTexture });
        onReadyRef.current?.(path, loadedTexture);
        previousLease?.release();
      },
      (error: unknown) => {
        candidateLease.release();
        onErrorRef.current?.(error, path);
      },
    );

    return () => {
      active = false;
      if (retainedLease.current !== candidateLease) candidateLease.release();
    };
  }, [path]);

  useEffect(
    () => () => {
      retainedLease.current?.release();
      retainedLease.current = null;
    },
    [],
  );

  // Keep the last good surface on screen while a new quality/focus variant is
  // loading. A path mismatch is intentional: dropping to null would flash the
  // flat fallback material whenever the selected planet changes.
  return loaded?.texture ?? null;
}

export function textureDisposalCount(): number {
  return disposedTextureCount;
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

export function textureReadinessDetails(): readonly {
  path: string;
  references: number;
  status: TextureReadiness;
}[] {
  return [...textureReadiness.entries()].map(([path, status]) => ({
    path,
    references: textureCache.get(path)?.references ?? 0,
    status,
  }));
}

export function disposeTextureCache(): void {
  for (const [path, entry] of textureCache.entries()) {
    if (entry.disposeTimer) clearTimeout(entry.disposeTimer);
    entry.expired = true;
    if (entry.texture) disposeLoadedTexture(entry.texture);
    entry.texture = null;
    setReadiness(path, "idle");
  }
  textureCache.clear();
  failedTextureLoads.clear();
  disposedTextureCount = 0;
  if (textureReadiness.size > 0) {
    textureReadiness.clear();
    emitReadiness();
  }
}
