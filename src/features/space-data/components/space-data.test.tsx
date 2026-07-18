import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ApodRecord } from "@/lib/data/external/models";
import type {
  ExternalMetadata,
  ExternalDataStatus,
} from "@/lib/data/external/types";

import { ApodFeature } from "./apod-feature";
import { DataState } from "./data-state";

const metadata: ExternalMetadata = {
  provider: "NASA Test",
  sourceTitle: "Test source",
  sourceUrl: "https://example.com/source",
  freshness: "latest-available",
  observedAt: "2026-07-17T00:00:00.000Z",
  retrievedAt: "2026-07-18T00:00:00.000Z",
  attribution: "NASA Test",
};

const apod: ApodRecord = {
  date: "2026-07-17",
  title: "Test nebula",
  excerpt: "A short source excerpt.",
  mediaType: "image",
  mediaUrl: "https://example.com/missing.jpg",
  serviceVersion: "v1",
  sourceUrl: "https://apod.nasa.gov/apod/",
};

describe("space data states", () => {
  for (const status of [
    "current",
    "near-live",
    "latest-available",
    "historical",
    "partial",
    "stale",
    "fallback",
    "unavailable",
  ] as const satisfies readonly ExternalDataStatus[]) {
    it(`renders ${status} without hiding provenance`, () => {
      render(<DataState metadata={metadata} status={status} />);
      expect(screen.getByText("NASA Test")).toBeVisible();
      expect(
        document.querySelector(`[data-status="${status}"]`),
      ).not.toBeNull();
    });
  }

  it("renders an explicit APOD empty state", () => {
    render(
      <ApodFeature records={[]} metadata={metadata} status="unavailable" />,
    );
    expect(
      screen.getByRole("heading", {
        name: "No dated APOD record is available",
      }),
    ).toBeVisible();
    expect(
      document.querySelector('[data-status="unavailable"]'),
    ).not.toBeNull();
    expect(
      screen.getByRole("img", {
        name: "Astronomy Picture of the Day. APOD media unavailable",
      }),
    ).toBeVisible();
  });

  it("replaces a failed remote APOD image with a designed fallback", () => {
    render(
      <ApodFeature records={[apod]} metadata={metadata} status="fallback" />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Test nebula" }));
    expect(screen.getByText("APOD media unavailable")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Open official record" }),
    ).toHaveAttribute("href", apod.sourceUrl);
  });
});
