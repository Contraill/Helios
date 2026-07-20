import { expect, test, type Locator, type Page } from "@playwright/test";

import { planetIds } from "../src/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
} from "../src/features/solar-system/types/celestial-body";

test.afterEach(async ({ page }) => {
  if (page.isClosed()) return;
  await page
    .goto("about:blank", { timeout: 10_000, waitUntil: "commit" })
    .catch(() => undefined);
});

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
const MOON_BODY_IDS = [...FEATURED_MOON_IDS, ...DWARF_SATELLITE_IDS];
const MOON_BODY_ID_SET = new Set<string>(MOON_BODY_IDS);
const PRIMARY_TEXTURE_PATTERN =
  /\/textures\/planets\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)\.webp$/;

async function keepGateOneAssetsBounded(page: Page) {
  await page.route("**/textures/**", async (route) => {
    if (PRIMARY_TEXTURE_PATTERN.test(route.request().url())) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
}

async function waitForExploreUi(page: Page) {
  await expect(
    page.getByRole("heading", { level: 1, name: "Explore" }),
  ).toBeVisible({
    timeout: 30_000,
  });
}

async function waitForScene(page: Page) {
  await waitForExploreUi(page);
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 30_000 },
  );
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            window.__HELIOS_SCENE_TEST__?.sceneContract.mountedBodyIds.length,
        ),
      { timeout: 30_000 },
    )
    .toBe(MOUNTED_BODY_IDS.length);
}

async function snapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__!);
}

async function activate(control: Locator) {
  await expect(control).toBeVisible({ timeout: 30_000 });
  await expect(control).toBeEnabled();
  await control.click({ force: true });
}

async function returnToNavigatorCategories(page: Page) {
  await activate(page.getByRole("tab", { name: "Navigator" }));
  const back = page.getByRole("button", { name: /Back/i });
  while ((await back.count()) > 0) await activate(back);
}

async function openCategory(page: Page, name: RegExp) {
  await returnToNavigatorCategories(page);
  await activate(page.getByRole("button", { name }));
}

function expectSamePosition(
  before: readonly number[],
  after: readonly number[],
) {
  expect(after).toHaveLength(3);
  for (let index = 0; index < 3; index += 1) {
    expect(Math.abs((after[index] ?? 0) - (before[index] ?? 0))).toBeLessThan(
      1e-5,
    );
  }
}

test("Gate 1 keeps scene ownership stable while visibility remains explicit", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.clear());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await keepGateOneAssetsBounded(page);
  await page.goto("/explore?sceneTest=1&at=2026-07-20T12%3A00%3A00.000Z");
  await waitForScene(page);

  await activate(page.getByRole("tab", { name: "Time" }));
  await activate(page.getByRole("button", { name: "Pause simulation" }));
  await expect(
    page.getByRole("button", { name: "Resume simulation" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).simulation.isPaused, {
      timeout: 30_000,
    })
    .toBe(true);
  const pausedSimulationAtMs = (await snapshot(page)).simulation.atMs;
  await openCategory(page, /Sun & planets/i);
  await activate(page.getByRole("button", { name: "Earth", exact: true }));
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();

  const initial = await snapshot(page);
  expect(initial.sceneContract.mountedBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(initial.sceneContract.visibleBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(initial.sceneContract.interactiveBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(initial.sceneContract.visibleOrbitBodyIds).toEqual(ORBIT_BODY_IDS);
  expect(initial.sceneContract.visibilityCategories).toMatchObject({
    planets: true,
    moons: true,
    asteroids: true,
    "dwarf-kuiper": true,
    comets: true,
    regions: true,
    orbits: true,
    labels: true,
  });
  const earthPosition = initial.bodyPositions.earth.position;
  expect(initial.simulation).toEqual({
    atMs: pausedSimulationAtMs,
    isPaused: true,
  });

  for (const category of [
    /Planetary moons/i,
    /Comets/i,
    /Regions & context/i,
  ]) {
    await openCategory(page, category);
    const categorySnapshot = await snapshot(page);
    expect(categorySnapshot.sceneContract.mountedBodyIds).toEqual(
      MOUNTED_BODY_IDS,
    );
    expect(categorySnapshot.sceneContract.visibleBodyIds).toEqual(
      MOUNTED_BODY_IDS,
    );
    expectSamePosition(
      earthPosition,
      categorySnapshot.bodyPositions.earth.position,
    );
    expect(categorySnapshot.simulation).toEqual({
      atMs: pausedSimulationAtMs,
      isPaused: true,
    });
  }
  await activate(page.getByRole("tab", { name: "Selection" }));
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();

  await activate(page.getByRole("tab", { name: "View" }));
  const moonsToggle = page.getByRole("button", { name: "Moons: visible" });
  await activate(moonsToggle);
  await expect(
    page.getByRole("button", { name: "Moons: hidden" }),
  ).toHaveAttribute("aria-pressed", "false");

  await expect
    .poll(async () => (await snapshot(page)).sceneContract.visibleBodyIds, {
      timeout: 30_000,
    })
    .toEqual(MOUNTED_BODY_IDS.filter((id) => !MOON_BODY_ID_SET.has(id)));
  const moonsHidden = await snapshot(page);
  expect(moonsHidden.sceneContract.visibleBodyIds).toEqual(
    MOUNTED_BODY_IDS.filter((id) => !MOON_BODY_ID_SET.has(id)),
  );
  expect(moonsHidden.sceneContract.mountedBodyIds).toEqual(MOUNTED_BODY_IDS);
  for (const id of MOON_BODY_IDS) {
    expect(moonsHidden.sceneContract.interactiveBodyIds).not.toContain(id);
    expect(moonsHidden.sceneContract.visibleOrbitBodyIds).not.toContain(id);
    expect(moonsHidden.sceneContract.visibleLabelBodyIds).not.toContain(id);
  }
  expect(moonsHidden.sceneContract.visibleBodyIds).toEqual(
    expect.arrayContaining(["earth", "halley", "asteroid-belt"]),
  );
  await activate(page.getByRole("tab", { name: "Selection" }));
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();

  await openCategory(page, /Planetary moons/i);
  await activate(page.getByRole("button", { name: /Jupiter.*4 featured/i }));
  await activate(page.getByRole("button", { name: "Europa", exact: true }));
  await expect(page.getByRole("heading", { name: "Europa" })).toBeVisible();
  expect((await snapshot(page)).sceneContract.visibleBodyIds).not.toContain(
    "moon-jupiter-europa",
  );

  await activate(page.getByRole("button", { name: "Show this object" }));
  await expect(
    page.getByRole("button", { name: "Hide this object" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).sceneContract.visibleBodyIds, {
      timeout: 30_000,
    })
    .toContain("moon-jupiter-europa");
  const europaShown = await snapshot(page);
  expect(europaShown.sceneContract.visibleBodyIds).toContain(
    "moon-jupiter-europa",
  );
  expect(europaShown.sceneContract.interactiveBodyIds).toContain(
    "moon-jupiter-europa",
  );
  expect(europaShown.sceneContract.visibleOrbitBodyIds).toContain(
    "moon-jupiter-europa",
  );
  expect(europaShown.sceneContract.visibleLabelBodyIds).toContain(
    "moon-jupiter-europa",
  );

  await activate(page.getByRole("button", { name: "Hide this object" }));
  await expect(
    page.getByRole("button", { name: "Show this object" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).sceneContract.visibleBodyIds, {
      timeout: 30_000,
    })
    .not.toContain("moon-jupiter-europa");
  await activate(page.getByRole("button", { name: "Show this object" }));
  await expect(
    page.getByRole("button", { name: "Hide this object" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).sceneContract.visibleBodyIds, {
      timeout: 30_000,
    })
    .toContain("moon-jupiter-europa");

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: "Restore all visibility" }));
  await expect(
    page.getByRole("button", { name: "Restore all visibility" }),
  ).toBeDisabled();
  await expect
    .poll(async () => (await snapshot(page)).sceneContract.visibleBodyIds, {
      timeout: 30_000,
    })
    .toEqual(MOUNTED_BODY_IDS);
  const restored = await snapshot(page);
  expect(restored.sceneContract.visibleBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(restored.sceneContract.mountedBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(restored.sceneContract.visibleOrbitBodyIds).toEqual(ORBIT_BODY_IDS);
  expect(restored.sceneContract.visibilityCategories).toMatchObject({
    planets: true,
    moons: true,
    asteroids: true,
    "dwarf-kuiper": true,
    comets: true,
    regions: true,
    orbits: true,
    labels: true,
  });
  expectSamePosition(earthPosition, restored.bodyPositions.earth.position);
  expect(restored.simulation).toEqual({
    atMs: pausedSimulationAtMs,
    isPaused: true,
  });
  await activate(page.getByRole("tab", { name: "Selection" }));
  await expect(page.getByRole("heading", { name: "Europa" })).toBeVisible();

  await activate(page.getByRole("tab", { name: "View" }));
  const comets = page.getByRole("button", { name: "Comets: visible" });
  await comets.focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Comets: hidden" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Comets: visible" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test.describe("Gate 1 compact visibility layout", () => {
  for (const width of [390, 430]) {
    test(`${width}px keeps visibility controls inside the mobile sheet`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await keepGateOneAssetsBounded(page);
      await page.goto("/explore");
      await waitForExploreUi(page);
      await activate(page.getByRole("button", { name: /Open controls/i }));
      await activate(page.getByRole("tab", { name: "View" }));

      const dialog = page.getByRole("dialog");
      const longControl = page.getByRole("button", {
        name: "Dwarf & Kuiper worlds: visible",
      });
      await expect(longControl).toBeVisible();
      const [dialogBox, controlBox] = await Promise.all([
        dialog.boundingBox(),
        longControl.boundingBox(),
      ]);
      expect(dialogBox).not.toBeNull();
      expect(controlBox).not.toBeNull();
      expect(controlBox!.x).toBeGreaterThanOrEqual(dialogBox!.x);
      expect(controlBox!.x + controlBox!.width).toBeLessThanOrEqual(
        dialogBox!.x + dialogBox!.width,
      );
      expect(controlBox!.height).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  }
});
