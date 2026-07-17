import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SourcePresentation } from "@/features/data-presentation/types/presentation";

import { MethodologyNote } from "./methodology-note";
import { SourceAttribution } from "./source-attribution";

const source: SourcePresentation = {
  accessedAt: "2026-07-17",
  freshness: "reference",
  id: "nasa-mars-facts",
  provider: "NASA Science",
  title: "Mars: Facts",
  url: "https://science.nasa.gov/mars/facts/",
};

describe("data presentation primitives", () => {
  it("renders source provenance with freshness and an external link", () => {
    render(<SourceAttribution sources={[source]} />);

    expect(screen.getByText("Reference")).toBeVisible();
    expect(screen.getByRole("link", { name: "Mars: Facts" })).toHaveAttribute(
      "href",
      source.url,
    );
    expect(screen.getByText(/Accessed 2026-07-17/)).toBeVisible();
  });

  it("renders methodology as a labelled complementary explanation", () => {
    render(
      <MethodologyNote
        body="Reference values are not live observations."
        label="Methodology"
        title="How to read this page"
      />,
    );

    expect(screen.getByText("Methodology")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "How to read this page" }),
    ).toBeVisible();
  });
});
