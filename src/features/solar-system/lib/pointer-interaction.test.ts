import { describe, expect, it } from "vitest";

import {
  CELESTIAL_DRAG_THRESHOLD_PX,
  CelestialPointerInteractionController,
} from "./pointer-interaction";

const sample = (
  overrides: Partial<
    Parameters<CelestialPointerInteractionController["begin"]>[0]
  > = {},
) => ({
  bodyId: "earth" as const,
  pointerId: 1,
  pointerType: "mouse",
  button: 0,
  clientX: 10,
  clientY: 10,
  ...overrides,
});

describe("celestial pointer interaction", () => {
  it("selects clicks and sub-threshold movement", () => {
    const controller = new CelestialPointerInteractionController();
    controller.begin(sample());
    expect(controller.finish(sample())).toBe("earth");

    controller.begin(sample());
    controller.move(sample({ clientX: 10 + CELESTIAL_DRAG_THRESHOLD_PX - 1 }));
    expect(controller.finish(sample())).toBe("earth");
  });

  it("keeps the real owner when another intersected body receives pointerup", () => {
    const controller = new CelestialPointerInteractionController();
    controller.begin(sample());

    expect(controller.finish(sample({ bodyId: "mars" }))).toBeNull();
    expect(controller.owns(1, "earth")).toBe(true);
    expect(controller.finish(sample())).toBe("earth");
  });

  it("only lets the owner cancel an active pointer", () => {
    const controller = new CelestialPointerInteractionController();
    controller.begin(sample());

    expect(controller.cancel(1, "mars")).toBe(false);
    expect(controller.owns(1, "earth")).toBe(true);
    expect(controller.cancel(1, "earth")).toBe(true);
    expect(controller.finish(sample())).toBeNull();
  });

  it("suppresses owner drag and right mouse selection", () => {
    const controller = new CelestialPointerInteractionController();
    controller.begin(sample());
    controller.move(sample({ clientX: 10 + CELESTIAL_DRAG_THRESHOLD_PX }));
    expect(controller.finish(sample())).toBeNull();

    controller.begin(sample({ button: 2 }));
    expect(controller.finish(sample({ button: 2 }))).toBeNull();
  });

  it("cleans cancelled pointers and treats multi-touch as a gesture", () => {
    const controller = new CelestialPointerInteractionController();
    controller.begin(sample({ pointerType: "touch" }));
    controller.begin(
      sample({
        pointerId: 2,
        pointerType: "touch",
        bodyId: "mars",
        clientX: 30,
      }),
    );
    expect(controller.finish(sample({ pointerType: "touch" }))).toBeNull();
    expect(
      controller.finish(
        sample({
          pointerId: 2,
          pointerType: "touch",
          bodyId: "mars",
          clientX: 30,
        }),
      ),
    ).toBeNull();

    controller.begin(sample());
    controller.cancel(1, "earth");
    expect(controller.finish(sample())).toBeNull();
  });
});
