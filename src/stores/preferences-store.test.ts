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

  it("updates render quality, motion and collapsible control surfaces", () => {
    state().setQualityLevel("low");
    state().setMotionPreference("reduced");
    state().setControlDeckExpanded(false);
    state().setTimePanelExpanded(true);

    expect(state().qualityLevel).toBe("low");
    expect(state().motionPreference).toBe("reduced");
    expect(state().controlDeckExpanded).toBe(false);
    expect(state().timePanelExpanded).toBe(true);

    state().toggleControlDeck();
    expect(state().controlDeckExpanded).toBe(true);
    state().toggleTimePanel();
    expect(state().timePanelExpanded).toBe(false);
  });

  it("rehydrates saved preferences", async () => {
    usePreferencesStore.setState(initialPreferencesState);
    localStorage.setItem(
      "helios-preferences",
      JSON.stringify({
        state: {
          controlDeckExpanded: false,
          timePanelExpanded: true,
          qualityLevel: "high",
          motionPreference: "standard",
        },
        version: 1,
      }),
    );

    await usePreferencesStore.persist.rehydrate();

    expect(state().qualityLevel).toBe("high");
    expect(state().motionPreference).toBe("standard");
    expect(state().controlDeckExpanded).toBe(false);
    expect(state().timePanelExpanded).toBe(true);
  });
});
