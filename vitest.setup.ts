import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { resetLocaleStore } from "@/stores/locale-store";

afterEach(() => {
  cleanup();
  resetLocaleStore();
  if (typeof document !== "undefined") {
    document.documentElement.lang = "en-US";
  }
});
