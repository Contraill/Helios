import { expect, test, type Page, type TestInfo } from "@playwright/test";

import type { HeliosSceneTestSnapshot } from "../src/features/solar-system/components/scene-test-probe";

const COMETS = [
  ["Halley", "halley"],
  ["Hale–Bopp", "hale-bopp"],
  ["Encke", "encke"],
  ["67P/Churyumov–Gerasimenko", "67p"],
  ["NEOWISE", "neowise"],
  ["Tempel 1", "tempel-1"],
] as const;

async function snapshot(page: Page): Promise<HeliosSceneTestSnapshot> {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__!);
}

async function waitForScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await expect
    .poll(async () => Boolean(await snapshot(page)), { timeout: 45_000 })
    .toBe(true);
}

async function openNavigatorRoot(page: Page) {
  await page.getByRole("tab", { name: "Navigator" }).click();
  for (let index = 0; index < 4; index += 1) {
    const back = page.getByRole("button", { name: /Back/i });
    if ((await back.count()) === 0) break;
    await back.click();
  }
}

async function selectComet(page: Page, name: string, id: string) {
  await openNavigatorRoot(page);
  await page.getByRole("button", { name: /Comets/i }).click();
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe("focus");
  await expect
    .poll(async () => (await snapshot(page)).camera?.targetBodyId, {
      timeout: 45_000,
    })
    .toBe(id);
}

async function screenStability(page: Page, bodyId: string) {
  return page.evaluate(async (id) => {
    const samples: Array<{
      body: readonly [number, number, number];
      x: number;
      y: number;
    }> = [];
    for (let index = 0; index < 18; index += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const scene = window.__HELIOS_SCENE_TEST__;
      const target = scene?.screenTargets[id];
      const body = scene?.bodyPositions[id]?.position;
      if (target?.visible && body) {
        samples.push({ body, x: target.x, y: target.y });
      }
    }
    const xRange =
      Math.max(...samples.map(({ x }) => x)) -
      Math.min(...samples.map(({ x }) => x));
    const yRange =
      Math.max(...samples.map(({ y }) => y)) -
      Math.min(...samples.map(({ y }) => y));
    const first = samples[0]?.body ?? [0, 0, 0];
    const last = samples.at(-1)?.body ?? first;
    return {
      count: samples.length,
      movement: Math.hypot(
        last[0] - first[0],
        last[1] - first[1],
        last[2] - first[2],
      ),
      xRange,
      yRange,
    };
  }, bodyId);
}

test("all comets remain camera-stable on their orbit during accelerated scientific playback", async ({
  page,
}) => {
  test.setTimeout(210_000);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("ERR_BLOCKED_BY_CLIENT")
    ) {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore?sceneTest=1&at=2026-07-27T00%3A00%3A00.000Z");
  await waitForScene(page);

  await page.getByRole("tab", { name: "View" }).click();
  await page.getByRole("button", { name: "Scientific", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Scientific", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "Time" }).click();
  await page.getByRole("button", { name: "1 year / sec" }).click();

  for (const [name, id] of COMETS) {
    await selectComet(page, name, id);
    const stability = await screenStability(page, id);
    expect(stability.count).toBeGreaterThanOrEqual(12);
    expect(stability.movement).toBeGreaterThan(0);
    expect(stability.xRange).toBeLessThan(2.5);
    expect(stability.yRange).toBeLessThan(2.5);
    const scene = await snapshot(page);
    expect(scene.orbitResources[id]?.visible).toBe(true);
    expect(scene.sceneContract.visibleBodyIds).toContain(id);
    await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
      "data-galactic-context",
      "local",
    );
  }

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("galactic context renders an exterior Milky Way and isolates the Solar System", async ({
  page,
}, testInfo: TestInfo) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);

  await page.getByRole("tab", { name: "View" }).click();
  await page.getByRole("button", { name: "Scientific", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Scientific", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  const canvas = page.locator("canvas").first();
  await canvas.hover();
  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, 8_000);
  }
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-galactic-context",
    "galactic",
    { timeout: 45_000 },
  );
  await expect
    .poll(async () => (await snapshot(page)).backdrop.galaxySurfaceReady, {
      timeout: 15_000,
    })
    .toBe(true);

  const galactic = await snapshot(page);
  expect(galactic.backdrop.milkyWayMounted).toBe(true);
  expect(galactic.backdrop.milkyWayOpacity).toBeGreaterThan(0.8);
  expect(galactic.backdrop.localStarsOpacity).toBeLessThan(0.01);
  expect(galactic.backdrop.galaxyRepresentation).toBe(
    "nasa-jpl-barred-spiral-model",
  );
  expect(galactic.backdrop.galaxySurfaceAsset).toBe(
    "/textures/context/milky-way-exterior-v1.webp",
  );
  expect(galactic.backdrop.galaxySurfaceReady).toBe(true);
  expect(galactic.backdrop.majorArmCount).toBe(2);
  expect(galactic.backdrop.minorArmCount).toBe(2);
  expect(galactic.backdrop.galaxyMapRadius).toBeGreaterThan(0);
  expect(galactic.camera!.distanceToTarget).toBeGreaterThan(
    galactic.backdrop.galaxyMapRadius * 2,
  );
  expect(galactic.backdrop.solarMarkerMounted).toBe(true);
  expect(galactic.backdrop.solarMarkerColor).toBe("#d98a45");
  expect(galactic.backdrop.solarMarkerRadiusRatio).toBeGreaterThan(0.5);
  expect(galactic.sceneContract.visibleBodyIds).toEqual([]);
  expect(galactic.sceneContract.visibleLabelBodyIds).toEqual([]);
  expect(galactic.sceneContract.visibleOrbitBodyIds).toEqual([]);
  await expect(
    page.getByText("Milky Way, from outside", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("milky-way-exterior.png"),
    animations: "disabled",
  });
});
