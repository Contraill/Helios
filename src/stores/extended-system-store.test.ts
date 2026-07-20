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

  it("retains only user-controlled representation cost preferences", () => {
    state().setDensity("detailed");
    state().setRepresentation("cinematic");
    state().toggleDust();
    expect(state().density).toBe("detailed");
    expect(state().representation).toBe("cinematic");
    expect(state().dustVisible).toBe(true);
    for (const removed of [
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

  it("migrates old clutter toggles without carrying dead state forward", async () => {
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
        version: 2,
      }),
    );
    await useExtendedSystemStore.persist.rehydrate();
    expect(state()).toMatchObject({
      density: "sparse",
      representation: "physical",
      dustVisible: true,
    });
    expect("asteroidBeltVisible" in state()).toBe(false);
    expect("panelExpanded" in state()).toBe(false);
  });
  it("rejects corrupted density, representation and dust values", async () => {
    localStorage.setItem(
      "helios-extended-system",
      JSON.stringify({
        state: {
          density: "infinite",
          representation: "photoreal",
          dustVisible: "yes",
        },
        version: 2,
      }),
    );
    await useExtendedSystemStore.persist.rehydrate();
    expect(state()).toMatchObject({
      density: "standard",
      representation: "physical",
      dustVisible: false,
    });
  });
});
