import type {
  NavigatorAction,
  NavigatorFrame,
  NavigatorState,
  NavigatorView,
} from "@/features/solar-system/types/celestial-navigation";

const ROOT_FRAME: NavigatorFrame = Object.freeze({
  returnFocusKey: null,
  view: Object.freeze({ kind: "categories" } satisfies NavigatorView),
});

export const initialNavigatorState: NavigatorState = Object.freeze({
  focusRequestKey: null,
  frames: Object.freeze([ROOT_FRAME]),
});

export function currentNavigatorView(state: NavigatorState): NavigatorView {
  return state.frames[state.frames.length - 1]?.view ?? ROOT_FRAME.view;
}

export function navigatorReducer(
  state: NavigatorState,
  action: NavigatorAction,
): NavigatorState {
  switch (action.type) {
    case "open-category": {
      const view: NavigatorView =
        action.category === "planetary-moons"
          ? { kind: "moon-parents" }
          : action.category === "dwarf-kuiper"
            ? { kind: "dwarf-parents" }
            : { kind: "category", category: action.category };
      return {
        focusRequestKey: null,
        frames: [
          ...state.frames,
          { returnFocusKey: action.returnFocusKey, view },
        ],
      };
    }
    case "open-moon-parent":
      return {
        focusRequestKey: null,
        frames: [
          ...state.frames,
          {
            returnFocusKey: action.returnFocusKey,
            view: {
              kind: "moons",
              parentPlanetId: action.parentPlanetId,
            },
          },
        ],
      };
    case "open-dwarf-system":
      return {
        focusRequestKey: null,
        frames: [
          ...state.frames,
          {
            returnFocusKey: action.returnFocusKey,
            view: { kind: "dwarf-system", parentBodyId: action.parentBodyId },
          },
        ],
      };
    case "back": {
      if (state.frames.length <= 1) return state;
      const leaving = state.frames[state.frames.length - 1];
      return {
        focusRequestKey: leaving?.returnFocusKey ?? null,
        frames: state.frames.slice(0, -1),
      };
    }
    case "reset":
      return initialNavigatorState;
    case "consume-focus-request":
      return state.focusRequestKey === null
        ? state
        : { ...state, focusRequestKey: null };
  }
}
