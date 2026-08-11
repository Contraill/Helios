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

test.describe("mobile responsive audit pass 2", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("Explore keeps its dock and bottom sheet readable", async ({ page }) => {
    await page.goto("/explore");

    const root = page.locator("[data-explore-responsive-root]");
    await expect(root).toHaveAttribute("data-shell-mode", "mobile");

    const dockBar = root.locator(":scope > div");
    await expect(dockBar).toBeVisible();
    await expectInsideViewport(page, dockBar);

    const openButton = dockBar.getByRole("button");
    const openBox = await openButton.boundingBox();
    expect(openBox).not.toBeNull();
    expect(openBox!.height).toBeGreaterThanOrEqual(44);
    await openButton.tap();

    const dialog = root.locator("dialog");
    await expect(dialog).toBeVisible();
    await expectInsideViewport(page, dialog);

    const tabs = dialog.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) {
      const tab = tabs.nth(index);
      await expectInsideViewport(page, tab);
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    const firstTab = await tabs.nth(0).boundingBox();
    const thirdTab = await tabs.nth(2).boundingBox();
    expect(firstTab).not.toBeNull();
    expect(thirdTab).not.toBeNull();
    expect(thirdTab!.y).toBeGreaterThan(firstTab!.y);
    await expectNoDocumentOverflow(page);
  });

  test("Compare contains wide content inside controlled regions", async ({
    page,
  }) => {
    await page.goto("/compare");

    const experience = page.locator("[data-compare-experience]");
    await expect(experience).toBeVisible();
    await expectInsideViewport(page, page.getByRole("heading", { level: 1 }));

    const selectors = experience.locator("section:first-child select");
    await expect(selectors).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expectInsideViewport(page, selectors.nth(index));
    }

    const worlds = experience.locator("section:nth-of-type(2) figure");
    await expect(worlds).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expectInsideViewport(page, worlds.nth(index));
    }

    const tableWrap = experience.locator("section:nth-of-type(4) > div");
    await expectInsideViewport(page, tableWrap);
    expect(
      await tableWrap.evaluate(
        (element) => element.scrollWidth >= element.clientWidth,
      ),
    ).toBe(true);
    await expectNoDocumentOverflow(page);
  });

  test("Missions stacks hero actions and keeps long copy in bounds", async ({
    page,
  }) => {
    await page.goto("/missions");

    const pageRoot = page.locator("[data-missions-page]");
    const heading = pageRoot.getByRole("heading", { level: 1 });
    await expectInsideViewport(page, heading);

    const explore = pageRoot.getByRole("link", { name: "Explore the system" });
    const data = pageRoot.getByRole("link", { name: "Read the data policy" });
    await expectVerticalOrder(explore, data);

    const scope = pageRoot.locator("header dl");
    await expectInsideViewport(page, scope);
    await expectNoDocumentOverflow(page);
  });
});

test.describe("narrow phone overflow guard", () => {
  test.use({ hasTouch: true, viewport: { width: 320, height: 720 } });

  for (const route of ["/compare", "/missions"] as const) {
    test(`${route} does not widen the document`, async ({ page }) => {
      await page.goto(route);
      await expectNoDocumentOverflow(page);
      await expectInsideViewport(page, page.getByRole("heading", { level: 1 }));
    });
  }
});
