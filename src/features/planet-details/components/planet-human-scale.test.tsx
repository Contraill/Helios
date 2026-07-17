import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlanetHumanScale } from "./planet-human-scale";

function renderHumanScale({
  gravityDefinition = "surface-equatorial",
  gravityEarthRatio,
  gravityMS2,
  planetName,
}: {
  gravityDefinition?: "surface-equatorial" | "one-bar-reference-level";
  gravityEarthRatio: number;
  gravityMS2: number;
  planetName: string;
}) {
  return render(
    <PlanetHumanScale
      body="A sourced human-scale comparison."
      dayDifferenceMinutes={42}
      gravityDefinition={gravityDefinition}
      gravityEarthRatio={gravityEarthRatio}
      gravityMS2={gravityMS2}
      planetName={planetName}
      sunlightTravelMinutes={12.4}
      title={`Standing on ${planetName}`}
    />,
  );
}

describe("PlanetHumanScale", () => {
  it("calculates a Mercury scale reading without producing NaN", () => {
    renderHumanScale({
      gravityEarthRatio: 3.7 / 9.80665,
      gravityMS2: 3.7,
      planetName: "Mercury",
    });

    fireEvent.change(screen.getByLabelText("Earth scale reading"), {
      target: { value: "70" },
    });

    expect(screen.getByText("26.4")).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("calculates Jupiter at the one-bar reference level", () => {
    renderHumanScale({
      gravityDefinition: "one-bar-reference-level",
      gravityEarthRatio: 24.79 / 9.80665,
      gravityMS2: 24.79,
      planetName: "Jupiter",
    });

    fireEvent.change(screen.getByLabelText("Earth scale reading"), {
      target: { value: "70" },
    });

    expect(screen.getByText("177")).toBeInTheDocument();
    expect(screen.getByText(/one-bar reference/i)).toBeInTheDocument();
  });

  it("associates invalid input with an accessible validation message", () => {
    renderHumanScale({
      gravityEarthRatio: 1,
      gravityMS2: 9.80665,
      planetName: "Earth",
    });

    const input = screen.getByLabelText("Earth scale reading");
    fireEvent.change(input, { target: { value: "1001" } });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/from 0 to 1,000/i)).toBeInTheDocument();
  });
});
