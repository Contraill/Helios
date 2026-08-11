import { expect, test, type Page } from "@playwright/test";

import type { HeliosSceneTestSnapshot } from "../src/features/solar-system/components/scene-test-probe";

test.use({
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});

async function snapshot(page: Page): Promise<HeliosSceneTestSnapshot> {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__!);
}

async function waitForScene(page: Page): Promise<void> {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await expect
    .poll(async () => Boolean(await snapshot(page)), { timeout: 45_000 })
    .toBe(true);
}

async function performTranslatedPinchOut(page: Page): Promise<void> {
  await page
    .locator("canvas")
    .first()
    .evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.52;
      const dispatch = (
        type: string,
        pointerId: number,
        clientX: number,
        clientY: number,
        isPrimary: boolean,
      ) => {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            buttons: type === "pointerup" ? 0 : 1,
            cancelable: true,
            clientX,
            clientY,
            isPrimary,
            pointerId,
            pointerType: "touch",
            pressure: type === "pointerup" ? 0 : 0.5,
          }),
        );
      };

      dispatch("pointerdown", 41, centerX - 34, centerY, true);
      dispatch("pointerdown", 42, centerX + 34, centerY, false);
      for (let step = 1; step <= 6; step += 1) {
        const translation = step * 7;
        const separation = 34 + step * 18;
        dispatch(
          "pointermove",
          41,
          centerX - separation,
          centerY + translation,
          true,
        );
        dispatch(
          "pointermove",
          42,
          centerX + separation,
          centerY + translation,
          false,
        );
      }
      dispatch("pointerup", 41, centerX - 142, centerY + 42, true);
      dispatch("pointerup", 42, centerX + 142, centerY + 42, false);
    });
}

test("portrait mobile zoom keeps the Milky Way visible, centred and frame-safe", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "deviceMemory", {
      configurable: true,
      value: 8,
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 8,
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);

  const canvas = page.locator("canvas").first();
  await performTranslatedPinchOut(page);
  await canvas.hover();
  for (let index = 0; index < 10; index += 1) {
    await page.mouse.wheel(0, 8_000);
  }

  const shell = page.locator(".solar-canvas-shell");
  await expect(shell).toHaveAttribute("data-renderer-dpr", "1-1.25");
  await expect(shell).toHaveAttribute("data-renderer-tier", "economy");
  await expect(shell).toHaveAttribute("data-galactic-context", "galactic", {
    timeout: 45_000,
  });
  await expect
    .poll(async () => (await snapshot(page)).backdrop.milkyWayOpacity, {
      timeout: 15_000,
    })
    .toBeGreaterThan(0.8);

  const portrait = await snapshot(page);
  const cameraDistance = portrait.camera?.distanceToTarget ?? 0;
  const target = portrait.camera?.target ?? [0, 0, 0];
  const targetDistance = Math.hypot(...target);
  const radiusRatio =
    cameraDistance > 0
      ? portrait.backdrop.galaxyMapRadius / cameraDistance
      : Number.POSITIVE_INFINITY;

  expect(portrait.backdrop.milkyWayMounted).toBe(true);
  expect(portrait.backdrop.galaxySurfaceReady).toBe(true);
  expect(targetDistance).toBeLessThan(80);
  expect(radiusRatio).toBeGreaterThan(0);
  expect(radiusRatio).toBeLessThan(0.19);
  expect(portrait.sceneContract.visibleBodyIds).toEqual([]);
  expect(portrait.sceneContract.visibleLabelBodyIds).toEqual([]);
  expect(portrait.sceneContract.visibleOrbitBodyIds).toEqual([]);

  const portraitRadius = portrait.backdrop.galaxyMapRadius;
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(shell).toHaveAttribute("data-renderer-dpr", "1-1.25");
  await expect(shell).toHaveAttribute("data-galactic-context", "galactic");
  await expect
    .poll(async () => (await snapshot(page)).backdrop.galaxyMapRadius, {
      timeout: 15_000,
    })
    .toBeGreaterThan(portraitRadius * 1.2);

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);

  await canvas.hover();
  const returnTargetDistances: number[] = [];
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, -8_000);
    await page.waitForTimeout(34);
    const current = await snapshot(page);
    returnTargetDistances.push(
      Math.hypot(...(current.camera?.target ?? [0, 0, 0])),
    );
  }
  for (let index = 1; index < returnTargetDistances.length; index += 1) {
    expect(returnTargetDistances[index]).toBeLessThanOrEqual(
      returnTargetDistances[index - 1] + 0.75,
    );
  }
  await expect(shell).toHaveAttribute("data-galactic-context", "local", {
    timeout: 45_000,
  });
  await expect
    .poll(async () => (await snapshot(page)).backdrop.milkyWayOpacity, {
      timeout: 15_000,
    })
    .toBeLessThan(0.08);

  const returned = await snapshot(page);
  expect(Math.hypot(...(returned.camera?.target ?? [0, 0, 0]))).toBeLessThan(1);
  expect(returned.sceneContract.visibleBodyIds.length).toBeGreaterThan(0);
});

test("constrained handhelds lower framebuffer load and reduced motion uses demand rendering", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(navigator, "deviceMemory", {
      configurable: true,
      value: 4,
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 4,
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);

  const shell = page.locator(".solar-canvas-shell");
  await expect(shell).toHaveAttribute("data-renderer-dpr", "1-1");
  await expect(shell).toHaveAttribute("data-renderer-tier", "economy");
  await expect(shell).toHaveAttribute("data-render-loop", "demand");
});
