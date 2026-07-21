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

  it("retires extended-system storage idempotently", () => {
    localStorage.setItem(
      "helios-extended-system",
      JSON.stringify({
        state: {
          dustVisible: true,
          density: "sparse",
          representation: "physical",
        },
        version: 4,
      }),
    );

    expect(() => migrateLegacyExplorePreferences(localStorage)).not.toThrow();
    expect(localStorage.getItem("helios-extended-system")).toBeNull();
    expect(() => migrateLegacyExplorePreferences(localStorage)).not.toThrow();
    expect(localStorage.getItem("helios-extended-system")).toBeNull();
  });
});

it("migrates legacy orbit and label choices into versioned visibility state", async () => {
  localStorage.setItem(
    "helios-exploration",
    JSON.stringify({
      state: {
        scaleMode: "scientific",
        orbitsVisible: false,
        labelsVisible: true,
      },
      version: 1,
    }),
  );

  migrateLegacyExplorePreferences(localStorage);

  const visibility = JSON.parse(
    localStorage.getItem("helios-scene-visibility") ?? "null",
  ) as { state: Record<string, unknown>; version: number };
  expect(visibility.version).toBe(1);
  expect(visibility.state.orbitsVisible).toBe(false);
  expect(visibility.state.labelsVisible).toBe(true);
  expect(
    Object.values(visibility.state.categories as Record<string, boolean>),
  ).toEqual([true, true, true, true, true, true]);

  const exploration = JSON.parse(
    localStorage.getItem("helios-exploration") ?? "null",
  ) as { state: Record<string, unknown>; version: number };
  expect(exploration.version).toBe(2);
  expect(exploration.state).not.toHaveProperty("orbitsVisible");
  expect(exploration.state).not.toHaveProperty("labelsVisible");
});

it("drops malformed envelopes so hydration can fall back safely", () => {
  localStorage.setItem("helios-exploration", "{bad-json");
  localStorage.setItem("helios-scene-visibility", "not-json");

  expect(() => migrateLegacyExplorePreferences(localStorage)).not.toThrow();
  expect(localStorage.getItem("helios-exploration")).toBeNull();
  expect(localStorage.getItem("helios-scene-visibility")).toBeNull();
});
