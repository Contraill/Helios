import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

import { JSDOM } from "jsdom";
import { createJiti } from "jiti";
import React from "react";

const ROOT = process.cwd();
globalThis.React = React;
const require = createRequire(import.meta.url);
const dom = new JSDOM(
  '<!doctype html><html lang="en-US"><body></body></html>',
  {
    url: "https://heliios.vercel.app/",
  },
);

for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLButtonElement",
  "HTMLDialogElement",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
    writable: true,
  });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = (callback) => {
  callback(Date.now());
  return 1;
};
globalThis.cancelAnimationFrame = () => {};
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
dom.window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
dom.window.ResizeObserver = globalThis.ResizeObserver;

require.extensions[".css"] = (module) => {
  module.exports = new Proxy({}, { get: (_, key) => String(key) });
};

const jiti = createJiti(
  path.join(ROOT, "scripts/interaction-audit-runner.cjs"),
  {
    interopDefault: true,
    jsx: true,
    alias: {
      "@": path.join(ROOT, "src"),
      "next/navigation": path.join(
        ROOT,
        "scripts/audit-next-navigation-stub.cjs",
      ),
    },
  },
);

const { act, cleanup, fireEvent, render, screen } =
  await import("@testing-library/react");

function fail(message) {
  throw new Error(message);
}

const { LocaleProvider, resetLocaleStore } = jiti(
  path.join(ROOT, "src/stores/locale-store.tsx"),
);
const { LocaleSwitcher } = jiti(
  path.join(ROOT, "src/components/layout/locale-switcher.tsx"),
);

render(
  React.createElement(
    LocaleProvider,
    { initialLocale: "en" },
    React.createElement(LocaleSwitcher),
  ),
);
const turkishButton = screen.getByRole("button", { name: "TR" });
turkishButton.focus();
fireEvent.click(turkishButton);
if (document.activeElement !== turkishButton) {
  fail("Language change dropped focus from its trigger.");
}
if (document.documentElement.lang !== "tr-TR") {
  fail("Language change did not update the document language.");
}
if (turkishButton.getAttribute("aria-pressed") !== "true") {
  fail("Language change did not expose the selected state.");
}
if (!screen.getByRole("status").textContent?.trim()) {
  fail("Language change did not produce an accessible status message.");
}
cleanup();
resetLocaleStore();

const { resetExploreSceneUiStore, useExploreSceneUiStore } = jiti(
  path.join(ROOT, "src/stores/explore-scene-ui-store.ts"),
);
const { ExploreSceneDock } = jiti(
  path.join(
    ROOT,
    "src/features/solar-system/components/explore-scene-dock.tsx",
  ),
);
const originalGetComputedStyle = globalThis.getComputedStyle;
globalThis.getComputedStyle = () => ({
  getPropertyValue: (name) =>
    name === "--explore-shell-mode" ? "desktop" : "",
});
dom.window.getComputedStyle = globalThis.getComputedStyle;
resetExploreSceneUiStore();
render(
  React.createElement(ExploreSceneDock, {
    navigator: React.createElement("p", null, "Navigator content"),
    scaleNotice: "Exploration scale",
    selection: React.createElement(
      "h2",
      { "data-selection-summary-heading": true, tabIndex: -1 },
      "Ceres",
    ),
    time: React.createElement("p", null, "Time content"),
    view: React.createElement("p", null, "View content"),
  }),
);
act(() => useExploreSceneUiStore.getState().openSelectionPanel());
const selectedHeading = screen.getByRole("heading", { name: "Ceres" });
if (document.activeElement !== selectedHeading) {
  fail("Opening the selection panel did not move focus to its summary.");
}
cleanup();
resetExploreSceneUiStore();
globalThis.getComputedStyle = originalGetComputedStyle;
dom.window.getComputedStyle = originalGetComputedStyle;

const { PlanetHumanScale } = jiti(
  path.join(
    ROOT,
    "src/features/planet-details/components/planet-human-scale.tsx",
  ),
);
render(
  React.createElement(PlanetHumanScale, {
    body: "A sourced human-scale comparison.",
    dayDifferenceMinutes: 42,
    gravityDefinition: "surface-equatorial",
    gravityEarthRatio: 1,
    gravityMS2: 9.80665,
    planetName: "Earth",
    sunlightTravelMinutes: 8.3,
    title: "Standing on Earth",
  }),
);
const reading = screen.getByLabelText("Earth scale reading");
fireEvent.change(reading, { target: { value: "1001" } });
if (reading.getAttribute("aria-invalid") !== "true") {
  fail("Invalid personal input was not exposed with aria-invalid.");
}
if (!screen.getByRole("alert").textContent?.includes("0 to 1,000")) {
  fail("Invalid personal input was not announced as an alert.");
}
const result = document.querySelector(
  '[data-testid="planet-weight-result"][aria-live="polite"]',
);
if (!result) {
  fail("Personal result value is not exposed through a focused live region.");
}
cleanup();

console.log(
  "Accessibility interaction audit passed: language focus, selection focus and form announcements checked.",
);
