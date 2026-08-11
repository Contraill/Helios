import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectNoDocumentOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function expectInsideViewport(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
}

async function expectVerticalOrder(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(secondBox!.y + 1);
}

test.describe("mobile responsive audit pass 4", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("home APOD stacks media, copy and controls without widening the page", async ({
    page,
  }) => {
    await page.goto("/");

    const feature = page.locator("[data-apod-feature]");
    await expect(feature).toBeVisible();
    const media = feature.locator("[data-apod-media]");
    const copy = feature.locator("[data-apod-copy]");
    await expectVerticalOrder(media, copy);
    await expectInsideViewport(page, media);
    await expectInsideViewport(page, copy);

    const actions = feature.locator("[data-apod-actions]");
    if ((await actions.count()) > 0) {
      for (const control of await actions.locator("button, a").all()) {
        await expectInsideViewport(page, control);
        const box = await control.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }

    const state = feature.locator("[data-data-state]");
    await expect(state).toBeVisible();
    await expect(state).toHaveCSS("display", "grid");
    await expectNoDocumentOverflow(page);
  });

  test("not-found state keeps recovery visible beside the game entry", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/this-route-does-not-exist");

    const state = page.locator('[data-route-state="not-found-game"]');
    await expect(state).toBeVisible();
    await expect(page.getByTestId("not-found-game-canvas")).toBeVisible();
    await expect(page.locator('[data-game-phase="idle"]')).toBeVisible();
    await expect(
      page.getByRole("link", { name: /home|ana sayfa/i }),
    ).toBeVisible();
    await expectNoDocumentOverflow(page);
  });

  test("shared route loading state is bounded by the phone viewport", async ({
    page,
  }) => {
    await page.goto("/");
    const loading = page.locator("[data-route-loading]");
    await page.evaluate(() => {
      const target = document.createElement("div");
      target.className = "scene-loading scene-loading--route";
      target.dataset.routeLoading = "explore";
      target.setAttribute("role", "status");
      target.innerHTML =
        "<span>Preparing a deliberately long localized Solar System loading message</span>";
      document.querySelector("main")?.prepend(target);
    });

    await expect(loading).toBeVisible();
    await expectInsideViewport(page, loading);
    await expectNoDocumentOverflow(page);
  });

  test("home omits the site footer and stays inside the safe mobile content column", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-site-footer]")).toHaveCount(0);
    await expectNoDocumentOverflow(page);
  });
});

test.describe("final narrow-phone route-family sweep", () => {
  test.use({ hasTouch: true, viewport: { width: 320, height: 720 } });

  const routes = [
    "/",
    "/compare",
    "/missions",
    "/data",
    "/about",
    "/case-study",
    "/body/sun",
    "/body/moon-jupiter-europa",
    "/planet/mars",
    "/region/heliosphere",
  ] as const;

  test("every public page template stays within the document width", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    for (const route of routes) {
      await test.step(route, async () => {
        const response = await page.goto(route, {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status(), route).toBe(200);
        const heading = page.getByRole("heading", { level: 1 });
        await expect(heading, route).toBeVisible();
        await expectInsideViewport(page, heading);
        await expectNoDocumentOverflow(page);
      });
    }
  });
});
