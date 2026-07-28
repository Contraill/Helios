import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPlanetDetailContent } from "@/content/planet-details";
import { getPlanetById, planets } from "@/content/planets";
import { createPlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";

import { MarsDetailPage } from "./mars-detail-page";
import { PlanetDetailPage } from "./planet-detail-page";

describe("custom planet route contract", () => {
  it("keeps every hero in-page link paired with a rendered destination", () => {
    for (const planet of planets) {
      const content = getPlanetDetailContent(planet.id);
      const model = createPlanetDetailModel(planet, planets, content.sourceIds);
      const { container, unmount } = render(
        planet.id === "mars" ? (
          <MarsDetailPage model={model} />
        ) : (
          <PlanetDetailPage
            content={content}
            model={model}
            showHumanScale={planet.id !== "earth"}
          />
        ),
      );

      for (const anchor of container.querySelectorAll<HTMLAnchorElement>(
        'a[href^="#"]',
      )) {
        const id = anchor.getAttribute("href")?.slice(1);
        expect(id, `${planet.id} has an empty in-page link`).toBeTruthy();
        expect(
          container.querySelector(`#${CSS.escape(id ?? "")}`),
          `${planet.id} links to missing #${id}`,
        ).not.toBeNull();
      }
      unmount();
    }
  });

  it("uses canonical body URLs for previous and next planet navigation", () => {
    const earth = getPlanetById("earth");
    if (!earth) throw new Error("Earth is missing from the planet catalogue.");
    const content = getPlanetDetailContent(earth.id);
    const model = createPlanetDetailModel(earth, planets, content.sourceIds);

    render(
      <PlanetDetailPage
        content={content}
        model={model}
        showHumanScale={false}
      />,
    );

    expect(screen.getByRole("link", { name: /Venus/i })).toHaveAttribute(
      "href",
      "/body/venus",
    );
    expect(screen.getByRole("link", { name: /Mars/i })).toHaveAttribute(
      "href",
      "/body/mars",
    );
  });
});
