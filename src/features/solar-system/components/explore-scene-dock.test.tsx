import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  resetExploreSceneUiStore,
  useExploreSceneUiStore,
} from "@/stores/explore-scene-ui-store";

import { ExploreSceneDock } from "./explore-scene-dock";

const props = {
  time: <p>Time content</p>,
  navigator: <p>Navigator content</p>,
  scaleNotice: "Exploration scale",
  selection: <p>Selection content</p>,
  view: <p>View content</p>,
};

function setCssMode(mode: "desktop" | "compact" | "mobile") {
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: (name: string) =>
      name === "--explore-shell-mode" ? mode : "",
  } as CSSStyleDeclaration);
}

describe("ExploreSceneDock", () => {
  beforeEach(() => {
    resetExploreSceneUiStore();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders one controlled desktop panel without an independent media query", () => {
    setCssMode("desktop");
    render(<ExploreSceneDock {...props} />);
    expect(screen.getByText("Navigator content")).toBeVisible();
    expect(screen.queryByText("Time content")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Time" }));
    expect(screen.getByText("Time content")).toBeVisible();
    expect(screen.queryByText("Navigator content")).toBeNull();
  });

  it("keeps a scrollable dock owner for wide constrained-height layouts", () => {
    setCssMode("compact");
    render(<ExploreSceneDock {...props} />);
    expect(
      screen.getByRole("complementary", { name: "Explore scene controls" }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("uses the CSS contract to expose a modal bottom sheet and restores focus", () => {
    setCssMode("mobile");
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: showModal,
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      }),
    });

    render(<ExploreSceneDock {...props} />);
    const trigger = screen.getByRole("button", { name: /Open controls/i });
    fireEvent.click(trigger);
    expect(showModal).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: /Close Explore controls/i }),
    );
    expect(useExploreSceneUiStore.getState().mobileDockOpen).toBe(false);
    expect(trigger).toHaveFocus();
  });
});
