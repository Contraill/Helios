import { expect, test, type Locator, type Page } from "@playwright/test";

import { planetIds } from "../src/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
} from "../src/features/solar-system/types/celestial-body";

const MOUNTED_BODY_IDS = [
  "sun",
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...DWARF_SATELLITE_IDS,
  ...EXTENDED_BODY_IDS,
  ...SYSTEM_REGION_IDS,
].sort();
const ORBIT_BODY_IDS = [
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...DWARF_SATELLITE_IDS,
  ...EXTENDED_BODY_IDS,
].sort();
const PRIMARY_TEXTURE_PATTERN =
  /\/textures\/planets\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)\.webp$/;

async function keepSecondaryAssetsBounded(page: Page) {
  await page.route("**/textures/**", async (route) => {
    if (PRIMARY_TEXTURE_PATTERN.test(route.request().url())) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
}

async function activate(control: Locator) {
  await expect(control).toBeVisible({ timeout: 30_000 });
  await expect(control).toBeEnabled();
  await control.click({ force: true });
}

async function snapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__!);
}

async function waitForScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await expect
    .poll(
      async () => (await snapshot(page)).sceneContract.mountedBodyIds.length,
      { timeout: 45_000 },
    )
    .toBe(MOUNTED_BODY_IDS.length);
}

async function waitForCameraMode(page: Page, mode: string) {
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe(mode);
}

async function openNavigatorCategory(page: Page, name: RegExp) {
  await activate(page.getByRole("tab", { name: "Navigator" }));
  const back = page.getByRole("button", { name: /Back/i });
  while ((await back.count()) > 0) await activate(back);
  await activate(page.getByRole("button", { name }));
}

async function selectNavigatorBody(page: Page, name: string) {
  const beforeVersion = (await snapshot(page)).camera?.transitionVersion ?? 0;
  const control = page.getByRole("button", { name, exact: true });
  await activate(control);
  await expect
    .poll(async () => (await snapshot(page)).camera?.transitionVersion ?? 0, {
      timeout: 45_000,
    })
    .toBeGreaterThan(beforeVersion);
  await waitForCameraMode(page, "focus");
  return control;
}

async function waitForScreenTarget(page: Page, bodyId: string) {
  await expect
    .poll(async () => (await snapshot(page)).screenTargets?.[bodyId]?.visible, {
      timeout: 45_000,
    })
    .toBe(true);
  const target = (await snapshot(page)).screenTargets?.[bodyId];
  expect(target).toBeDefined();
  return target!;
}

function direction(position: readonly number[], target: readonly number[]) {
  const x = (position[0] ?? 0) - (target[0] ?? 0);
  const y = (position[1] ?? 0) - (target[1] ?? 0);
  const z = (position[2] ?? 0) - (target[2] ?? 0);
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length] as const;
}

function expectDirectionClose(
  actual: readonly number[],
  expected: readonly number[],
  tolerance = 0.08,
) {
  for (let index = 0; index < 3; index += 1) {
    expect(
      Math.abs((actual[index] ?? 0) - (expected[index] ?? 0)),
    ).toBeLessThan(tolerance);
  }
}

test("Gate 2 unifies camera, selection and gesture ownership", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => localStorage.clear());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await keepSecondaryAssetsBounded(page);
  await page.goto("/explore?sceneTest=1&at=2026-07-20T12%3A00%3A00.000Z");
  await waitForScene(page);

  await activate(page.getByRole("tab", { name: "Time" }));
  await activate(page.getByRole("button", { name: "Pause simulation" }));
  await expect
    .poll(async () => (await snapshot(page)).simulation.isPaused)
    .toBe(true);
  const stableSimulation = (await snapshot(page)).simulation.atMs;

  const earthCanvasTarget = await waitForScreenTarget(page, "earth");
  await page.mouse.click(earthCanvasTarget.x, earthCanvasTarget.y);
  await waitForCameraMode(page, "focus");
  await expect
    .poll(async () => (await snapshot(page)).camera?.selectedBodyId, {
      timeout: 45_000,
    })
    .toBe("earth");
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();

  await page.keyboard.press("Escape");
  await waitForCameraMode(page, "overview");
  await expect
    .poll(async () => (await snapshot(page)).camera?.selectedBodyId)
    .toBeNull();

  const earthDragTarget = await waitForScreenTarget(page, "earth");
  await page.mouse.move(earthDragTarget.x, earthDragTarget.y);
  await page.mouse.down();
  await page.mouse.move(earthDragTarget.x + 80, earthDragTarget.y + 24, {
    steps: 8,
  });
  await page.mouse.up();
  await expect
    .poll(async () => (await snapshot(page)).camera?.selectedBodyId)
    .toBeNull();
  await expect(page.getByRole("heading", { name: "Earth" })).toHaveCount(0);

  await openNavigatorCategory(page, /Sun & planets/i);
  await selectNavigatorBody(page, "Earth");
  const earthFocus = await snapshot(page);
  expect(earthFocus.camera?.selectedBodyId).toBe("earth");
  expect(earthFocus.camera?.targetBodyId).toBe("earth");
  expect(earthFocus.camera?.distanceToTarget).toBeGreaterThanOrEqual(
    earthFocus.camera?.minimumDistance ?? 0,
  );

  const canvas = page.locator("canvas").first();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const startX = box.x + box.width * 0.62;
  const startY = box.y + box.height * 0.5;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 90, startY + 34, { steps: 8 });
  await page.mouse.up();
  const rotated = await snapshot(page);
  expect(rotated.camera?.selectedBodyId).toBe("earth");
  expect(rotated.camera?.mode).toBe("focus");
  expect(
    Math.abs(
      (rotated.camera?.azimuth ?? 0) - (earthFocus.camera?.azimuth ?? 0),
    ),
  ).toBeGreaterThan(0.01);

  const beforeZoom = rotated.camera?.distanceToTarget ?? 0;
  await canvas.hover();
  await page.mouse.wheel(0, -420);
  await expect
    .poll(async () => (await snapshot(page)).camera?.distanceToTarget)
    .not.toBe(beforeZoom);
  const zoomed = await snapshot(page);
  expect(zoomed.camera?.distanceToTarget).toBeGreaterThanOrEqual(
    zoomed.camera?.minimumDistance ?? 0,
  );

  await openNavigatorCategory(page, /Planetary moons/i);
  await activate(page.getByRole("button", { name: /Jupiter.*4 featured/i }));
  await selectNavigatorBody(page, "Europa");
  const europaExplore = await snapshot(page);
  const exploreDirection = direction(
    europaExplore.camera!.position,
    europaExplore.camera!.target,
  );

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: "Scientific", exact: true }));
  await waitForCameraMode(page, "focus");
  const europaScientific = await snapshot(page);
  expect(europaScientific.camera?.selectedBodyId).toBe("moon-jupiter-europa");
  expect(europaScientific.camera?.targetBodyId).toBe("moon-jupiter-europa");
  expectDirectionClose(
    direction(
      europaScientific.camera!.position,
      europaScientific.camera!.target,
    ),
    exploreDirection,
  );

  await openNavigatorCategory(page, /Regions & context/i);
  for (const region of ["Kuiper belt", "Oort cloud", "Heliosphere"] as const) {
    await openNavigatorCategory(page, /Regions & context/i);
    await selectNavigatorBody(page, region);
    await waitForCameraMode(page, "focus");
    const regionSnapshot = await snapshot(page);
    expect(regionSnapshot.camera?.mode).toBe("focus");
    expect(regionSnapshot.camera?.distanceToTarget).toBeGreaterThanOrEqual(
      regionSnapshot.camera?.minimumDistance ?? 0,
    );
  }

  await canvas.hover();
  await page.mouse.move(startX, startY);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(startX + 70, startY + 32, { steps: 6 });
  await page.mouse.up({ button: "right" });
  await waitForCameraMode(page, "free");
  expect((await snapshot(page)).camera?.selectedBodyId).toBe("heliosphere");

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: /^Guided$/i }));
  await waitForCameraMode(page, "focus");
  expect((await snapshot(page)).camera?.targetBodyId).toBe("heliosphere");

  await openNavigatorCategory(page, /Sun & planets/i);
  await activate(page.getByRole("button", { name: "Mars", exact: true }));
  const marsVersion = (await snapshot(page)).camera?.transitionVersion ?? 0;
  await openNavigatorCategory(page, /Sun & planets/i);
  const neptuneButton = page.getByRole("button", {
    name: "Neptune",
    exact: true,
  });
  await activate(neptuneButton);
  await expect
    .poll(async () => (await snapshot(page)).camera?.selectedBodyId, {
      timeout: 45_000,
    })
    .toBe("neptune");
  await expect
    .poll(async () => (await snapshot(page)).camera?.transitionVersion ?? 0, {
      timeout: 45_000,
    })
    .toBeGreaterThan(marsVersion);
  await waitForCameraMode(page, "focus");
  const neptune = await snapshot(page);
  expect(neptune.camera?.selectedBodyId).toBe("neptune");
  expect(neptune.camera?.targetBodyId).toBe("neptune");
  expect(neptune.camera?.transitionVersion).toBeGreaterThan(marsVersion);

  await page.keyboard.press("Escape");
  await waitForCameraMode(page, "overview");
  await expect(neptuneButton).toBeFocused();
  expect((await snapshot(page)).camera?.selectedBodyId).toBeNull();

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: /Reset view/i }));
  await waitForCameraMode(page, "overview");
  const finalSnapshot = await snapshot(page);
  expect(finalSnapshot.sceneContract.mountedBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(finalSnapshot.sceneContract.visibleBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(finalSnapshot.sceneContract.visibleOrbitBodyIds).toEqual(
    ORBIT_BODY_IDS,
  );
  expect(finalSnapshot.simulation).toEqual({
    atMs: stableSimulation,
    isPaused: true,
  });
});
