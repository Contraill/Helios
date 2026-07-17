import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { uiStrings } from "@/lib/i18n/ui-strings";

import { SceneFallback } from "./scene-fallback";

describe("SceneFallback", () => {
  it("keeps the WebGL failure understandable", () => {
    render(<SceneFallback />);
    expect(screen.getByRole("status")).toHaveTextContent(
      uiStrings.pages.explore.fallbackTitle,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      uiStrings.pages.explore.fallbackBody,
    );
  });
});
