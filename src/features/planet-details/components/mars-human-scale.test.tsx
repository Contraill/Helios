import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarsHumanScale } from "./mars-human-scale";

const props = {
  dayDifferenceMinutes: 39.582,
  gravityEarthRatio: 0.3783,
  gravityMS2: 3.71,
  sunlightTravelMinutes: 12.67,
};

describe("MarsHumanScale", () => {
  it("calculates an Earth-style scale equivalent without sending data", () => {
    render(<MarsHumanScale {...props} />);

    const input = screen.getByRole("textbox", {
      name: "Earth scale reading",
    });
    fireEvent.change(input, { target: { value: "70" } });

    expect(screen.getByText("26.5")).toBeInTheDocument();
    expect(screen.getByText(/mass does not change/i)).toBeInTheDocument();
  });

  it("exposes a validation error for invalid readings", () => {
    render(<MarsHumanScale {...props} />);

    const input = screen.getByRole("textbox", {
      name: "Earth scale reading",
    });
    fireEvent.change(input, { target: { value: "invalid" } });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a number from 0 to 1,000.")).toBeVisible();
  });
});
