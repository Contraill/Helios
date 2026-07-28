import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ExternalMetadata } from "@/lib/data/external/types";
import { resetLocaleStore, useLocaleStore } from "@/stores/locale-store";

import { HomeExperience } from "./home-experience";

const metadata: ExternalMetadata = {
  provider: "NASA",
  sourceTitle: "APOD",
  sourceUrl: "https://apod.nasa.gov/apod/",
  freshness: "latest-available",
  retrievedAt: "2026-07-26T00:00:00.000Z",
  attribution: "NASA",
};

describe("HomeExperience", () => {
  beforeEach(() => resetLocaleStore());

  it("switches the editorial home surface without changing route semantics", () => {
    render(
      <HomeExperience metadata={metadata} records={[]} status="unavailable" />,
    );

    expect(
      screen.getByRole("link", { name: "Explore the system" }),
    ).toHaveAttribute("href", "/explore");

    act(() => useLocaleStore.getState().setLocale("tr"));

    expect(
      screen.getByRole("link", { name: "Sistemi keşfet" }),
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getByText("Kaynaklı, sinematik bir Güneş Sistemi"),
    ).toBeVisible();
  });
});
