import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { planets } from "@/content/planets";
import { createComparisonPlanets } from "@/features/comparison/lib/create-comparison-planets";

import { CompareExperience } from "./compare-experience";

const { push, searchState, writeText } = vi.hoisted(() => ({
  push: vi.fn(),
  searchState: { value: "a=earth&b=mars" },
  writeText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/compare",
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(searchState.value),
}));

const comparisonPlanets = createComparisonPlanets(planets);

describe("CompareExperience", () => {
  beforeEach(() => {
    searchState.value = "a=earth&b=mars";
    push.mockClear();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("keeps selector state shareable and exposes body-detail links", () => {
    render(<CompareExperience planets={comparisonPlanets} />);

    fireEvent.change(screen.getByLabelText("First planet"), {
      target: { value: "venus" },
    });
    expect(push).toHaveBeenCalledWith("/compare?a=venus&b=mars", {
      scroll: false,
    });

    expect(
      screen.getByRole("link", { name: "Open Earth page" }),
    ).toHaveAttribute("href", "/body/earth");
    expect(
      screen.getByRole("link", { name: "Open Mars page" }),
    ).toHaveAttribute("href", "/body/mars");
    expect(screen.getByRole("table")).toHaveAccessibleName(
      "Planetary reference comparison for Earth and Mars.",
    );
  });

  it("announces invalid personal inputs instead of silently hiding results", () => {
    render(<CompareExperience planets={comparisonPlanets} />);

    const weight = screen.getByLabelText(/Earth scale reading/i);
    fireEvent.change(weight, { target: { value: "-1" } });

    expect(weight).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a value from 0 to 1,000,000.",
    );
  });

  it("rejects oversized personal inputs before calculations can overflow", () => {
    render(<CompareExperience planets={comparisonPlanets} />);

    const weight = screen.getByLabelText(/Earth scale reading/i);
    fireEvent.change(weight, { target: { value: "1e308" } });

    expect(weight).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(/Infinity/)).not.toBeInTheDocument();
  });

  it("keeps duplicate-world comparisons stable and labels both destinations", () => {
    searchState.value = "a=earth&b=earth";
    render(<CompareExperience planets={comparisonPlanets} />);

    expect(
      screen.getByText(/You selected the same world twice/, {
        selector: '[role="status"]',
      }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: "Open Earth page" }),
    ).toHaveLength(2);
  });

  it("identifies retrograde rotation instead of hiding direction", () => {
    searchState.value = "a=venus&b=uranus";
    render(<CompareExperience planets={comparisonPlanets} />);

    expect(screen.getAllByText(/retrograde/i)).toHaveLength(2);
  });

  it("copies the current comparison address with an announced result", async () => {
    render(<CompareExperience planets={comparisonPlanets} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy share link" }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringMatching(/\?a=earth&b=mars$/),
    );
    expect(await screen.findByText("Comparison link copied.")).toBeVisible();
  });

  it("uses sourced planet textures in the comparison scale visual", () => {
    render(<CompareExperience planets={comparisonPlanets} />);

    const visualOrbs = document.querySelectorAll<HTMLElement>(
      '[class*="worldOrb"]',
    );
    expect(visualOrbs).toHaveLength(2);
    expect(visualOrbs[0]?.style.backgroundImage).toContain(
      "/textures/planets/earth.webp",
    );
    expect(visualOrbs[1]?.style.backgroundImage).toContain(
      "/textures/planets/mars.webp",
    );
  });
});
