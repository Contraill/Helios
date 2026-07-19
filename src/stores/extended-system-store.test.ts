import { beforeEach, describe, expect, it } from "vitest";

import {
  resetExtendedSystemStore,
  useExtendedSystemStore,
} from "./extended-system-store";

describe("extended system store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExtendedSystemStore();
  });

  it("starts with progressive disclosure instead of every context layer", () => {
    const state = useExtendedSystemStore.getState();
    expect(state.asteroidBeltVisible).toBe(true);
    expect(state.kuiperBeltVisible).toBe(true);
    expect(state.cometsVisible).toBe(false);
    expect(state.oortCloudVisible).toBe(false);
    expect(state.dustVisible).toBe(false);
    expect(state.heliosphereVisible).toBe(false);
  });

  it("reveals a requested layer idempotently", () => {
    const state = useExtendedSystemStore.getState();
    state.showLayer("cometsVisible");
    state.showLayer("cometsVisible");
    expect(useExtendedSystemStore.getState().cometsVisible).toBe(true);
  });

  it("migrates the clutter-heavy first release to safe defaults", async () => {
    localStorage.setItem(
      "helios-extended-system",
      JSON.stringify({
        state: {
          asteroidBeltVisible: true,
          kuiperBeltVisible: true,
          cometsVisible: true,
          oortCloudVisible: true,
          dustVisible: true,
          heliosphereVisible: true,
          density: "standard",
          representation: "physical",
        },
        version: 1,
      }),
    );

    await useExtendedSystemStore.persist.rehydrate();
    const state = useExtendedSystemStore.getState();
    expect(state.cometsVisible).toBe(false);
    expect(state.oortCloudVisible).toBe(false);
    expect(state.dustVisible).toBe(false);
    expect(state.heliosphereVisible).toBe(false);
  });
});
