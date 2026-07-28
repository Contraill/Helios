import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { resetLocaleStore } from "@/stores/locale-store";

function createLocalStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    clear: () => store.clear(),
    getItem: (key) => store.get(String(key)) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(String(key));
    },
    setItem: (key, value) => {
      store.set(String(key), String(value));
    },
    get length() {
      return store.size;
    },
  } as Storage;
}

const localStorageStub = createLocalStorageStub();

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageStub,
  });
}

if (
  typeof window !== "undefined" &&
  typeof window.localStorage === "undefined"
) {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorageStub,
  });
}

afterEach(() => {
  cleanup();
  resetLocaleStore();
  if (typeof document !== "undefined") {
    document.documentElement.lang = "en-US";
  }
});
