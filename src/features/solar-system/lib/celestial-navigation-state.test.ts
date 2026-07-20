import { describe, expect, it } from "vitest";

import {
  currentNavigatorView,
  initialNavigatorState,
  navigatorReducer,
} from "./celestial-navigation-state";

describe("celestial navigator state", () => {
  it("drills from categories to a moon parent and restores the triggering focus key", () => {
    const parents = navigatorReducer(initialNavigatorState, {
      type: "open-category",
      category: "planetary-moons",
      returnFocusKey: "category-planetary-moons",
    });
    expect(currentNavigatorView(parents)).toEqual({ kind: "moon-parents" });

    const moons = navigatorReducer(parents, {
      type: "open-moon-parent",
      parentPlanetId: "jupiter",
      returnFocusKey: "moon-parent-jupiter",
    });
    expect(currentNavigatorView(moons)).toEqual({
      kind: "moons",
      parentPlanetId: "jupiter",
    });

    const back = navigatorReducer(moons, { type: "back" });
    expect(currentNavigatorView(back)).toEqual({ kind: "moon-parents" });
    expect(back.focusRequestKey).toBe("moon-parent-jupiter");

    const consumed = navigatorReducer(back, {
      type: "consume-focus-request",
    });
    expect(consumed.focusRequestKey).toBeNull();
  });

  it("drills through a dwarf parent system and restores focus", () => {
    const parents = navigatorReducer(initialNavigatorState, {
      type: "open-category",
      category: "dwarf-kuiper",
      returnFocusKey: "category-dwarf-kuiper",
    });
    expect(currentNavigatorView(parents)).toEqual({ kind: "dwarf-parents" });
    const system = navigatorReducer(parents, {
      type: "open-dwarf-system",
      parentBodyId: "haumea",
      returnFocusKey: "dwarf-parent-haumea",
    });
    expect(currentNavigatorView(system)).toEqual({
      kind: "dwarf-system",
      parentBodyId: "haumea",
    });
    const back = navigatorReducer(system, { type: "back" });
    expect(currentNavigatorView(back)).toEqual({ kind: "dwarf-parents" });
    expect(back.focusRequestKey).toBe("dwarf-parent-haumea");
  });

  it("never backs past the category root", () => {
    expect(navigatorReducer(initialNavigatorState, { type: "back" })).toBe(
      initialNavigatorState,
    );
  });
});
