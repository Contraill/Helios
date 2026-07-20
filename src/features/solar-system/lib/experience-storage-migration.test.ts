import { beforeEach, describe, expect, it } from "vitest";

import { migrateLegacyExplorePreferences } from "./experience-storage-migration";

describe("Explore preference retirement", () => {
  beforeEach(() => localStorage.clear());

  it("removes legacy quality, motion and panel ownership without throwing", () => {
    localStorage.setItem(
      "helios-preferences",
      JSON.stringify({
        state: {
          controlDeckExpanded: false,
          motionPreference: "reduced",
          qualityLevel: "low",
          timePanelExpanded: true,
        },
        version: 2,
      }),
    );

    migrateLegacyExplorePreferences(localStorage);

    expect(localStorage.getItem("helios-preferences")).toBeNull();
  });

  it("removes malformed legacy storage", () => {
    localStorage.setItem("helios-preferences", "{not-json");
    expect(() => migrateLegacyExplorePreferences(localStorage)).not.toThrow();
    expect(localStorage.getItem("helios-preferences")).toBeNull();
  });
});
