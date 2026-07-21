import { beforeEach, describe, expect, it } from "vitest";

import {
  resetExtendedSystemStore,
  useExtendedSystemStore,
} from "./extended-system-store";

function state() {
  return useExtendedSystemStore.getState();
}

describe("extended system preferences", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExtendedSystemStore();
  });

  it("starts with only the dust preference and its toggle action", () => {
    expect(Object.keys(state()).sort()).toEqual(["dustVisible", "toggleDust"]);
    expect(state().dustVisible).toBe(false);
  });

  it("toggles zodiacal dust context", () => {
    state().toggleDust();
    expect(state().dustVisible).toBe(true);
    state().toggleDust();
    expect(state().dustVisible).toBe(false);
  });

  for (const version of [2, 3]) {
    it(`migrates version ${version} without retaining retired options`, async () => {
      localStorage.setItem(
        "helios-extended-system",
        JSON.stringify({
          state: {
            asteroidBeltVisible: false,
            kuiperBeltVisible: false,
            cometsVisible: true,
            oortCloudVisible: true,
            heliosphereVisible: true,
            panelExpanded: true,
            dustVisible: true,
            density: "sparse",
            representation: "physical",
          },
          version,
        }),
      );
      await useExtendedSystemStore.persist.rehydrate();

      expect(state().dustVisible).toBe(true);
      for (const removed of [
        "density",
        "representation",
        "setDensity",
        "setRepresentation",
        "panelExpanded",
        "cometsVisible",
        "asteroidBeltVisible",
        "kuiperBeltVisible",
        "oortCloudVisible",
        "heliosphereVisible",
      ]) {
        expect(removed in state()).toBe(false);
      }
    });
  }

  it("falls back to hidden dust for corrupted persisted values", async () => {
    localStorage.setItem(
      "helios-extended-system",
      JSON.stringify({
        state: {
          dustVisible: "yes",
          density: "detailed",
          representation: "cinematic",
        },
        version: 3,
      }),
    );
    await useExtendedSystemStore.persist.rehydrate();

    expect(state().dustVisible).toBe(false);
    expect("density" in state()).toBe(false);
    expect("representation" in state()).toBe(false);
    expect("setDensity" in state()).toBe(false);
    expect("setRepresentation" in state()).toBe(false);
  });
});
