import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";

import { SceneFallback } from "./scene-fallback";

describe("SceneFallback", () => {
  it("keeps the WebGL failure understandable", () => {
    render(<SceneFallback />);
    expect(screen.getByRole("status")).toHaveTextContent(
      getExplorePageCopy("en").fallbackTitle,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      getExplorePageCopy("en").fallbackBody,
    );
  });
});
