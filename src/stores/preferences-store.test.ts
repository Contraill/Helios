import { beforeEach, describe, expect, it } from "vitest";

import {
  initialPreferencesState,
  resetPreferencesStore,
  usePreferencesStore,
} from "./preferences-store";

function state() {
  return usePreferencesStore.getState();
}

describe("preferences store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferencesStore();
  });

  it("updates render quality and motion preference", () => {
    state().setQualityLevel("low");
    state().setMotionPreference("reduced");
    expect(state().qualityLevel).toBe("low");
    expect(state().motionPreference).toBe("reduced");
  });

  it("rehydrates saved preferences", async () => {
    usePreferencesStore.setState(initialPreferencesState);
    localStorage.setItem(
      "helios-preferences",
      JSON.stringify({
        state: { qualityLevel: "high", motionPreference: "standard" },
        version: 1,
      }),
    );

    await usePreferencesStore.persist.rehydrate();

    expect(state().qualityLevel).toBe("high");
    expect(state().motionPreference).toBe("standard");
  });
});
