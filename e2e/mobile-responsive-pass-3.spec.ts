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

test.describe("mobile responsive audit pass 3", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("extended body pages keep hero, metrics and sources inside the viewport", async ({
    page,
  }) => {
    await page.goto("/body/ceres");

    const root = page.locator("[data-body-detail-page]");
    await expect(root).toBeVisible();
    await expectInsideViewport(page, root.getByRole("heading", { level: 1 }));

    const heroLinks = root.locator("header a");
    await expect(heroLinks.first()).toBeVisible();
    for (let index = 0; index < (await heroLinks.count()); index += 1) {
      await expectInsideViewport(page, heroLinks.nth(index));
    }

    const metricCards = root.locator(":scope > section:first-of-type dl > div");
    await expect(metricCards.first()).toBeVisible();
    for (let index = 0; index < (await metricCards.count()); index += 1) {
      await expectInsideViewport(page, metricCards.nth(index));
    }

    await expectNoDocumentOverflow(page);
  });

  test("planet detail hero links stack and visual annotations do not collide", async ({
    page,
  }) => {
    await page.goto("/planet/neptune");

    const root = page.locator("[data-planet-detail-page]");
    const hero = root.locator(":scope > header");
    await expectInsideViewport(page, hero.getByRole("heading", { level: 1 }));

    const links = hero.locator("nav a");
    await expect(links).toHaveCount(3);
    await expectVerticalOrder(links.nth(0), links.nth(1));
    await expectVerticalOrder(links.nth(1), links.nth(2));

    const visual = hero.locator(":scope > div:last-child");
    await expectInsideViewport(page, visual);
    const caption = visual.locator(":scope > p");
    const ledger = visual.locator(":scope > dl");
    const captionBox = await caption.boundingBox();
    const ledgerBox = await ledger.boundingBox();
    expect(captionBox).not.toBeNull();
    expect(ledgerBox).not.toBeNull();
    expect(ledgerBox!.y + ledgerBox!.height).toBeLessThanOrEqual(
      captionBox!.y + 1,
    );

    await expectNoDocumentOverflow(page);
  });

  test("Data keeps navigation and provider metadata readable", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto("/data");

    const root = page.locator("[data-data-page]");
    await expectInsideViewport(page, root.getByRole("heading", { level: 1 }));

    const navLinks = root.locator(":scope > header nav a");
    await expect(navLinks.first()).toBeVisible();
    await expectVerticalOrder(navLinks.nth(0), navLinks.nth(1));
    for (let index = 0; index < (await navLinks.count()); index += 1) {
      await expectInsideViewport(page, navLinks.nth(index));
    }

    const states = root.locator("[data-data-state]");
    if ((await states.count()) > 0) {
      await expectInsideViewport(page, states.first());
    }
    await expectNoDocumentOverflow(page);
  });

  for (const route of ["/about", "/case-study"] as const) {
    test(`${route} compacts its editorial hero and metric band`, async ({
      page,
    }) => {
      await page.goto(route);

      const root = page.locator("[data-editorial-page]");
      await expectInsideViewport(page, root.getByRole("heading", { level: 1 }));

      const metricCards = root.locator(":scope > dl > div");
      await expect(metricCards).toHaveCount(4);
      for (let index = 0; index < 4; index += 1) {
        await expectInsideViewport(page, metricCards.nth(index));
      }

      const heroLinks = root.locator(":scope > header a");
      if ((await heroLinks.count()) > 1) {
        await expectVerticalOrder(heroLinks.nth(0), heroLinks.nth(1));
      }
      await expectNoDocumentOverflow(page);
    });
  }
});

test.describe("pass 3 narrow phone overflow guard", () => {
  test.use({ hasTouch: true, viewport: { width: 320, height: 720 } });

  for (const route of [
    "/body/ceres",
    "/planet/neptune",
    "/data",
    "/about",
    "/case-study",
  ] as const) {
    test(`${route} does not widen a 320 px document`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto(route);
      await expectInsideViewport(page, page.getByRole("heading", { level: 1 }));
      await expectNoDocumentOverflow(page);
    });
  }
});
