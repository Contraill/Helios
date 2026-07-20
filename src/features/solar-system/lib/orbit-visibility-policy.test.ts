import { describe, expect, it } from "vitest";

import {
  backgroundLayerHasIndividualOrbit,
  orbitVisibilityForBody,
} from "./orbit-visibility-policy";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "./label-visibility-policy";

const base = {
  bodyVisible: true,
  orbitsVisible: true,
  selectedBodyId: null,
  hoveredBodyId: null,
} as const;

describe("orbit and label visibility policies", () => {
  it("applies global and effective-body visibility before relevance", () => {
    expect(
      orbitVisibilityForBody("earth", { ...base, orbitsVisible: false }),
    ).toBe("hidden");
    expect(
      orbitVisibilityForBody("earth", { ...base, bodyVisible: false }),
    ).toBe("hidden");
    expect(orbitVisibilityForBody("earth", base)).toBe("context");
  });

  it("keeps planet, moon and comet context orbits Navigator-independent and emphasizes selection", () => {
    expect(orbitVisibilityForBody("earth", base)).toBe("context");
    expect(orbitVisibilityForBody("moon-jupiter-europa", base)).toBe("context");
    expect(orbitVisibilityForBody("halley", base)).toBe("context");
    expect(
      orbitVisibilityForBody("halley", {
        ...base,
        selectedBodyId: "halley",
      }),
    ).toBe("selected");
    expect(
      orbitVisibilityForBody("moon-jupiter-europa", {
        ...base,
        hoveredBodyId: "moon-jupiter-europa",
      }),
    ).toBe("selected");
    expect(backgroundLayerHasIndividualOrbit()).toBe(false);
  });

  it("prioritizes selected and hovered labels without exposing hidden bodies", () => {
    expect(
      labelPriorityForBody("planet", {
        bodyVisible: false,
        hovered: false,
        labelsVisible: true,
        scaleMode: "exploration",
        selected: true,
      }),
    ).toBe("hidden");
    expect(
      labelPriorityForBody("moon", {
        bodyVisible: true,
        hovered: false,
        labelsVisible: true,
        scaleMode: "exploration",
        selected: true,
      }),
    ).toBe("selected");
    expect(
      labelPriorityForBody("comet", {
        bodyVisible: true,
        hovered: true,
        labelsVisible: true,
        scaleMode: "scientific",
        selected: false,
      }),
    ).toBe("hovered");
    expect(
      labelPriorityForBody("planet", {
        bodyVisible: true,
        hovered: false,
        labelsVisible: true,
        scaleMode: "scientific",
        selected: false,
      }),
    ).toBe("anchor");
    expect(
      labelPriorityForBody("planet", {
        bodyVisible: true,
        hovered: false,
        labelsVisible: true,
        scaleMode: "exploration",
        selected: false,
      }),
    ).toBe("hidden");
    expect(
      labelPriorityForBody("asteroid", {
        bodyVisible: true,
        contextEligible: true,
        hovered: false,
        labelsVisible: true,
        scaleMode: "exploration",
        selected: false,
      }),
    ).toBe("context");
    expect(
      labelPriorityForBody("star", {
        bodyVisible: true,
        hovered: false,
        labelsVisible: true,
        scaleMode: "exploration",
        selected: false,
      }),
    ).toBe("anchor");
    expect(shouldMountLabel("hidden")).toBe(false);
    expect(shouldMountLabel("selected")).toBe(true);
  });
});
