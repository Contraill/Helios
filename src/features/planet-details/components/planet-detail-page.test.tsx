import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planets } from "@/content/planets";
import { createPlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";

import { PlanetDetailPage } from "./planet-detail-page";

function earthModel() {
  const planet = getPlanetById("earth");
  if (!planet) throw new Error("Earth fixture is missing.");
  const content = getPlanetDetailContent("earth");
  return {
    content,
    model: createPlanetDetailModel(planet, planets, content.sourceIds),
  };
}

describe("PlanetDetailPage", () => {
  it("does not link to a human-scale section when that section is disabled", () => {
    const { content, model } = earthModel();
    render(
      <PlanetDetailPage
        content={content}
        model={model}
        showHumanScale={false}
      />,
    );

    expect(screen.queryByText("Jump to human scale")).not.toBeInTheDocument();
    expect(document.querySelector("#human-scale")).toBeNull();
    expect(screen.getByText("Method and sources")).toHaveAttribute(
      "href",
      "#sources",
    );
  });
  it("uses the local attributed planet texture in the editorial portrait", () => {
    const { content, model } = earthModel();
    render(
      <PlanetDetailPage
        content={content}
        model={model}
        showHumanScale={false}
      />,
    );

    const visual = document.querySelector('[role="img"][data-planet="earth"]');
    expect(visual).toHaveStyle({
      "--planet-editorial-texture": 'url("/textures/planets/earth.webp")',
    });
  });
});
