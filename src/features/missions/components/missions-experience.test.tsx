import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  MISSION_CATALOGUE,
  MISSION_PLANET_COUNT,
} from "@/features/missions/lib/mission-catalogue";
import { resetLocaleStore, useLocaleStore } from "@/stores/locale-store";

import { MissionsExperience } from "./missions-experience";

describe("MissionsExperience", () => {
  beforeEach(() => resetLocaleStore());

  it("renders sourced mission records and preserves their body links", () => {
    render(
      <MissionsExperience
        missions={MISSION_CATALOGUE}
        planetCount={MISSION_PLANET_COUNT}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(
      MISSION_CATALOGUE.length,
    );
    expect(screen.getByRole("link", { name: "Open Mercury" })).toHaveAttribute(
      "href",
      "/body/mercury",
    );
  });

  it("uses the persisted interface locale for the editorial shell", () => {
    render(
      <MissionsExperience
        missions={MISSION_CATALOGUE}
        planetCount={MISSION_PLANET_COUNT}
      />,
    );

    act(() => useLocaleStore.getState().setLocale("tr"));
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Dekor değil, kanıt olarak uzay araçları",
      }),
    ).toBeVisible();
  });
});
