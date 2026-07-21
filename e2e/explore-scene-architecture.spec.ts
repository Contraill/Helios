import { expect, test, type Page } from "@playwright/test";

import type { HeliosSceneTestSnapshot } from "../src/features/solar-system/components/scene-test-probe";
import { HORIZONS_SNAPSHOT } from "../src/lib/data/ephemeris/horizons-snapshot";

const PRIMARY_BODIES = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
] as const;

interface RuntimeAudit {
  readonly consoleErrors: string[];
  readonly pageErrors: string[];
  readonly requestFailures: string[];
}

function watchRuntime(page: Page): RuntimeAudit {
  const audit: RuntimeAudit = {
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
  };
  page.on("console", (message) => {
    if (message.type() === "error") audit.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => audit.pageErrors.push(error.message));
  page.on("requestfailed", (request) =>
    audit.requestFailures.push(
      `${request.url()} · ${request.failure()?.errorText ?? "failed"}`,
    ),
  );
  return audit;
}

async function waitForLoadedScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 30_000 },
  );
  await expect(page.getByTestId("explore-opening-loader")).toHaveCount(0);
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-bootstrap-ready",
    "true",
  );
}

async function sceneSnapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__ ?? null);
}

type PrimaryBodyId = (typeof PRIMARY_BODIES)[number];
type PrimarySurfaceSnapshot = Record<PrimaryBodyId, string | null>;

function primarySurfaceSnapshot(
  snapshot: HeliosSceneTestSnapshot | null,
): PrimarySurfaceSnapshot {
  return Object.fromEntries(
    PRIMARY_BODIES.map((bodyId) => [
      bodyId,
      snapshot?.surfaces[bodyId] ?? null,
    ]),
  ) as PrimarySurfaceSnapshot;
}

async function waitForPrimarySurfaceMaps(page: Page) {
  await expect
    .poll(
      async () => {
        const primary = primarySurfaceSnapshot(await sceneSnapshot(page));
        return PRIMARY_BODIES.every((bodyId) => Boolean(primary[bodyId]));
      },
      { timeout: 30_000 },
    )
    .toBe(true);
}

async function openNavigatorCategory(page: Page, name: RegExp) {
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name }).click();
}

async function assertNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function screenshotViewport(page: Page, path: string) {
  await waitForLoadedScene(page);
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path, animations: "disabled" });
}

test("bootstrap settles real primary materials, isolates one asset failure and keeps production instrumentation off", async ({
  browser,
}, testInfo) => {
  test.setTimeout(90_000);
  const normal = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const normalPage = await normal.newPage();
  const requestOrder: string[] = [];
  normalPage.on("request", (request) => {
    const match = request
      .url()
      .match(
        /\/textures\/planets\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)\.webp$/,
      );
    if (match?.[1]) requestOrder.push(match[1]);
  });
  await normalPage.goto("/explore");
  await waitForLoadedScene(normalPage);
  await expect(normalPage.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-secondary-stage",
    "true",
  );
  expect(requestOrder[0]).toBe("sun");
  expect(new Set(requestOrder)).toEqual(new Set(PRIMARY_BODIES));
  expect(
    await normalPage.evaluate(() => window.__HELIOS_SCENE_TEST__),
  ).toBeUndefined();
  await normalPage.screenshot({
    path: testInfo.outputPath("bootstrap-primary-ready.png"),
    animations: "disabled",
  });
  await normal.close();

  const degraded = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const degradedPage = await degraded.newPage();
  const audit = watchRuntime(degradedPage);
  await degradedPage.route("**/textures/planets/mars.webp", (route) =>
    route.abort("failed"),
  );
  await degradedPage.goto("/explore?sceneTest=1");
  await waitForLoadedScene(degradedPage);
  await expect(degradedPage.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-degraded-assets",
    "1",
  );
  await expect
    .poll(
      async () => {
        const primary = primarySurfaceSnapshot(
          await sceneSnapshot(degradedPage),
        );
        return PRIMARY_BODIES.every((bodyId) =>
          bodyId === "mars" ? bodyId in primary : Boolean(primary[bodyId]),
        );
      },
      { timeout: 30_000 },
    )
    .toBe(true);
  const degradedPrimary = primarySurfaceSnapshot(
    await sceneSnapshot(degradedPage),
  );
  expect(Object.keys(degradedPrimary)).toEqual([...PRIMARY_BODIES]);
  expect(degradedPrimary.mars).toBeNull();
  for (const bodyId of PRIMARY_BODIES.filter((id) => id !== "mars")) {
    expect(degradedPrimary[bodyId]).toBe(`/textures/planets/${bodyId}.webp`);
  }
  expect(audit.pageErrors).toEqual([]);
  expect(
    audit.requestFailures.filter((failure) => failure.includes("mars.webp")),
  ).toHaveLength(1);
  await degraded.close();
});

test("Time owns draft, scrubber, transport, URL and controller continuity", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  let ephemerisRequests = 0;
  await page.route("**/api/ephemeris?**", async (route) => {
    await route.fulfill({ json: HORIZONS_SNAPSHOT, status: 200 });
  });
  page.on("request", (request) => {
    if (request.url().includes("/api/ephemeris?")) ephemerisRequests += 1;
  });
  await page.goto("/explore?at=2024-01-15T12%3A30%3A00.000Z");
  await waitForLoadedScene(page);
  await expect.poll(() => ephemerisRequests).toBe(1);
  await page.getByRole("tab", { name: "Time" }).click();

  const field = page.getByLabel("UTC date and time");
  const draft = "2024-02-03T04:05:06";
  await field.focus();
  await field.fill(draft);
  await page.waitForTimeout(800);
  await expect(field).toHaveValue(draft);
  expect(new URL(page.url()).searchParams.get("at")).toBe(
    "2024-01-15T12:30:00.000Z",
  );

  const scrubber = page.getByRole("slider");
  const urlBeforeScrub = page.url();
  await scrubber.fill("5");
  await page.waitForTimeout(400);
  expect(page.url()).toBe(urlBeforeScrub);
  await expect(field).toHaveValue(draft);

  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("at"))
    .toBe("2024-02-03T04:05:06.000Z");
  await expect.poll(() => ephemerisRequests).toBe(2);

  await page.getByRole("button", { name: "Pause simulation" }).click();
  await screenshotViewport(page, testInfo.outputPath("time-paused.png"));
  const clock = page.locator("#time-control-panel time").first();
  const pausedAt = await clock.getAttribute("datetime");
  await page.getByRole("tab", { name: "View" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("tab", { name: "Time" }).click();
  await expect(
    page.getByRole("button", { name: "Resume simulation" }),
  ).toBeVisible();
  expect(await clock.getAttribute("datetime")).toBe(pausedAt);
  expect(ephemerisRequests).toBe(2);

  await page.getByRole("button", { name: "Resume simulation" }).click();
  await screenshotViewport(page, testInfo.outputPath("time-resumed.png"));
  await page.getByRole("button", { name: "1 day / sec" }).click();
  const beforeAcceleration = Date.parse(
    (await clock.getAttribute("datetime"))!,
  );
  await expect
    .poll(async () => Date.parse((await clock.getAttribute("datetime"))!))
    .toBeGreaterThan(beforeAcceleration + 12 * 60 * 60 * 1_000);

  await page.getByRole("button", { name: "Return to now" }).click();
  await expect.poll(() => ephemerisRequests).toBe(3);
  const resetAt = Date.parse((await clock.getAttribute("datetime"))!);
  expect(Math.abs(resetAt - Date.now())).toBeLessThan(60_000);
});

test("Explore and Scientific switch typed profiles without changing scene identity", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/explore?sceneTest=1&at=2024-01-15T12%3A30%3A00.000Z");
  await waitForLoadedScene(page);
  await waitForPrimarySurfaceMaps(page);
  await openNavigatorCategory(page, /Sun & planets/i);
  await page.getByRole("button", { name: "Earth", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();
  const explorationPrimarySurfaces = primarySurfaceSnapshot(
    await sceneSnapshot(page),
  );
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-render-loop",
    "demand",
  );
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-body-profile",
    "readable",
  );
  await screenshotViewport(
    page,
    testInfo.outputPath("explore-earth-close.png"),
  );

  await page.getByRole("tab", { name: "View" }).click();
  await page.getByRole("button", { name: "Scientific", exact: true }).click();
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-body-profile",
    "physical-ratio",
  );
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-distance-profile",
    "shared-ratio",
  );
  await page.getByRole("tab", { name: "Selection" }).click();
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();
  await waitForPrimarySurfaceMaps(page);
  expect(primarySurfaceSnapshot(await sceneSnapshot(page))).toEqual(
    explorationPrimarySurfaces,
  );
  expect(new URL(page.url()).searchParams.get("at")).toBe(
    "2024-01-15T12:30:00.000Z",
  );
  await expect(page.getByText(/Render quality|Motion/i)).toHaveCount(0);
  await screenshotViewport(
    page,
    testInfo.outputPath("scientific-earth-close.png"),
  );
  await screenshotViewport(
    page,
    testInfo.outputPath("scientific-golden-reference.png"),
  );

  await page.keyboard.press("Escape");
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-camera-mode",
    "overview",
    { timeout: 15_000 },
  );
  await page.waitForTimeout(700);
  await screenshotViewport(
    page,
    testInfo.outputPath("scientific-wide-system.png"),
  );

  await page.getByRole("tab", { name: "View" }).click();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-scene-profile",
    "exploration",
  );
  await page.waitForTimeout(700);
  await screenshotViewport(
    page,
    testInfo.outputPath("explore-wide-system.png"),
  );
  await screenshotViewport(
    page,
    testInfo.outputPath("quality-control-removed.png"),
  );
});

test("legacy quality, motion and panel storage is retired while supported stores hydrate", async ({
  page,
}) => {
  const audit = watchRuntime(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "helios-preferences",
      JSON.stringify({
        state: {
          controlDeckExpanded: false,
          motionPreference: "reduced",
          qualityLevel: "low",
          timePanelExpanded: true,
        },
        version: 2,
      }),
    );
    localStorage.setItem(
      "helios-exploration",
      JSON.stringify({
        state: {
          labelsVisible: false,
          orbitsVisible: false,
          scaleMode: "scientific",
        },
        version: 1,
      }),
    );
  });
  await page.goto("/explore");
  await waitForLoadedScene(page);
  expect(
    await page.evaluate(() => localStorage.getItem("helios-preferences")),
  ).toBeNull();
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-scene-profile",
    "scientific",
  );
  await page.getByRole("tab", { name: "View" }).click();
  await expect(
    page.getByRole("button", { name: /Orbit paths: hidden/i }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: /Body labels: hidden/i }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(audit.pageErrors).toEqual([]);
  expect(
    audit.consoleErrors.filter((message) => /hydration/i.test(message)),
  ).toEqual([]);
});

const responsiveCases: readonly {
  readonly height: number;
  readonly mobile?: boolean;
  readonly name: string;
  readonly width: number;
}[] = [
  { name: "desktop-dock", width: 1440, height: 1000 },
  { name: "constrained-height", width: 1100, height: 600 },
  { name: "dpr-zoom-regression", width: 640, height: 360, mobile: true },
  { name: "mobile-time-sheet", width: 390, height: 844, mobile: true },
] as const;

test.describe("loaded responsive scene ownership", () => {
  test.use({ deviceScaleFactor: 2, hasTouch: true });

  for (const entry of responsiveCases) {
    test(`${entry.name} remains functional`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: entry.width, height: entry.height });
      await page.goto("/explore");
      await waitForLoadedScene(page);
      const mode = await page
        .locator("[data-shell-mode]")
        .getAttribute("data-shell-mode");
      if (entry.mobile) {
        expect(mode).toBe("mobile");
        const trigger = page.getByRole("button", { name: /Open controls/i });
        await trigger.click();
        await page.getByRole("tab", { name: "Time" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Pause simulation" }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole("complementary", { name: "Explore scene controls" }),
        ).toBeVisible();
        for (const panel of ["Selection", "Navigator", "View", "Time"]) {
          await expect(page.getByRole("tab", { name: panel })).toBeVisible();
        }
      }
      await expect(page.getByText(/Render quality|Motion/i)).toHaveCount(0);
      await screenshotViewport(page, testInfo.outputPath(`${entry.name}.png`));
      if (entry.mobile) {
        await expect(
          page.getByRole("button", { name: /Close Explore controls/i }),
        ).toBeVisible();
      }
      await page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        const context =
          canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      });
    });
  }
});

test("renderer evidence covers orbit policy and selected extended bodies", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const audit = watchRuntime(page);
  await page.goto("/explore?sceneTest=1");
  await waitForLoadedScene(page);
  await waitForPrimarySurfaceMaps(page);
  await expect
    .poll(async () => (await sceneSnapshot(page))?.orbits.planet ?? 0)
    .toBe(8);

  await openNavigatorCategory(page, /Main-belt worlds/i);
  await page.getByRole("button", { name: "Ceres", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ceres" })).toBeVisible();
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name: /Back/i }).click();
  await page.getByRole("button", { name: /Regions & context/i }).click();
  await page.getByRole("tab", { name: "Selection" }).click();
  await expect(page.getByRole("heading", { name: "Ceres" })).toBeVisible();
  await expect
    .poll(async () => (await sceneSnapshot(page))?.orbits.extended ?? 0)
    .toBeGreaterThan(0);

  const snapshot = await sceneSnapshot(page);
  expect(snapshot?.gpu.programs ?? 0).toBeGreaterThan(0);
  expect(
    audit.consoleErrors.filter((message) => /shader|webgl/i.test(message)),
  ).toEqual([]);
  expect(audit.pageErrors).toEqual([]);
  await page.evaluate(() => {
    const canvasElement = document.querySelector("canvas");
    const context =
      canvasElement?.getContext("webgl2") ?? canvasElement?.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  });
});

test("Earth city lights produce day-side and terminator evidence", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const audit = watchRuntime(page);
  await page.goto("/explore?sceneTest=1");
  await waitForLoadedScene(page);
  await waitForPrimarySurfaceMaps(page);
  await openNavigatorCategory(page, /Sun & planets/i);
  await page.getByRole("button", { name: "Earth", exact: true }).click();
  await expect
    .poll(async () => (await sceneSnapshot(page))?.cityLights ?? null)
    .toMatchObject({
      materialReady: true,
      texturePath: "/textures/planets/earth-city-lights.webp",
      textureReady: true,
      uniformsReady: true,
    });

  const canvas = page.locator("canvas");
  await page.waitForTimeout(1_000);
  await canvas.screenshot({
    path: testInfo.outputPath("city-lights-day-side.png"),
    animations: "disabled",
  });
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const startX = box!.x + box!.width * 0.5;
  const startY = box!.y + box!.height * 0.55;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + box!.width * 0.15, startY, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(450);
  await canvas.screenshot({
    path: testInfo.outputPath("city-lights-terminator.png"),
    animations: "disabled",
  });

  const snapshot = await sceneSnapshot(page);
  expect(snapshot?.gpu.programs ?? 0).toBeGreaterThan(0);
  expect(
    audit.consoleErrors.filter((message) => /shader|webgl/i.test(message)),
  ).toEqual([]);
  expect(audit.pageErrors).toEqual([]);
  await page.evaluate(() => {
    const canvasElement = document.querySelector("canvas");
    const context =
      canvasElement?.getContext("webgl2") ?? canvasElement?.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  });
});

test("Earth night-side city lights render without daylight leakage", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const audit = watchRuntime(page);
  await page.goto("/explore?sceneTest=1");
  await waitForLoadedScene(page);
  await waitForPrimarySurfaceMaps(page);
  await openNavigatorCategory(page, /Sun & planets/i);
  await page.getByRole("button", { name: "Earth", exact: true }).click();
  await expect
    .poll(async () => (await sceneSnapshot(page))?.cityLights ?? null)
    .toMatchObject({
      materialReady: true,
      texturePath: "/textures/planets/earth-city-lights.webp",
      textureReady: true,
      uniformsReady: true,
    });

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const startX = box!.x + box!.width * 0.5;
  const startY = box!.y + box!.height * 0.55;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + box!.width * 0.24, startY, { steps: 24 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  await canvas.screenshot({
    path: testInfo.outputPath("city-lights-night-side.png"),
    animations: "disabled",
  });

  const snapshot = await sceneSnapshot(page);
  expect(snapshot?.cityLights.materialReady).toBe(true);
  expect(snapshot?.gpu.programs ?? 0).toBeGreaterThan(0);
  expect(
    audit.consoleErrors.filter((message) => /shader|webgl/i.test(message)),
  ).toEqual([]);
  expect(audit.pageErrors).toEqual([]);
  await page.evaluate(() => {
    const canvasElement = document.querySelector("canvas");
    const context =
      canvasElement?.getContext("webgl2") ?? canvasElement?.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  });
});
