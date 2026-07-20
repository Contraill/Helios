import { describe, expect, it } from "vitest";

import { EXTENDED_BODY_BY_ID } from "./extended-system";
import { MOON_BY_ID } from "./moon-catalogue";
import {
  extendedBodySceneVisibility,
  moonSceneVisibility,
  planetSceneVisibility,
  regionSceneVisibility,
} from "./scene-visibility-policy";

describe("scene visibility policy", () => {
  it("keeps non-category planets as low-emphasis anchors without moon targets", () => {
    const navigatorView = { kind: "moons", parentPlanetId: "jupiter" } as const;
    expect(
      planetSceneVisibility("jupiter", {
        navigatorView,
        selectedBodyId: null,
      }),
    ).toBe("primary");
    expect(
      planetSceneVisibility("saturn", {
        navigatorView,
        selectedBodyId: null,
      }),
    ).toBe("anchor");
    expect(
      moonSceneVisibility(MOON_BY_ID["moon-jupiter-europa"], {
        navigatorView,
        selectedBodyId: null,
      }),
    ).toBe("primary");
    expect(
      moonSceneVisibility(MOON_BY_ID["moon-saturn-titan"], {
        navigatorView,
        selectedBodyId: null,
      }),
    ).toBe("hidden");
  });

  it("keeps overview belts as anchors and category context overrides removed persisted toggles", () => {
    expect(
      regionSceneVisibility("asteroid-belt", {
        navigatorView: { kind: "categories" },
        selectedBodyId: null,
      }),
    ).toBe("anchor");
    expect(
      regionSceneVisibility("kuiper-belt", {
        navigatorView: { kind: "dwarf-parents" },
        selectedBodyId: null,
      }),
    ).toBe("anchor");
  });

  it("isolates small bodies by category and retains a selected region", () => {
    expect(
      extendedBodySceneVisibility(EXTENDED_BODY_BY_ID.halley, {
        navigatorView: { kind: "category", category: "comets" },
        selectedBodyId: null,
      }),
    ).toBe("primary");
    expect(
      extendedBodySceneVisibility(EXTENDED_BODY_BY_ID.vesta, {
        navigatorView: { kind: "category", category: "comets" },
        selectedBodyId: null,
      }),
    ).toBe("hidden");
    expect(
      regionSceneVisibility("oort-cloud", {
        navigatorView: { kind: "category", category: "sun-planets" },
        selectedBodyId: "oort-cloud",
      }),
    ).toBe("primary");
  });
});
