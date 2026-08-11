import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function expectVerticalOrder(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(secondBox!.y + 1);
}

test.describe("mobile layout contracts", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("home keeps the header compact and separates actions from scope metrics", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.locator("header.site-header");
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(headerBox!.height).toBeLessThan(160);

    const explore = page.getByRole("link", { name: "Explore the system" });
    const missions = page.getByRole("link", { name: "Follow the missions" });
    const compare = page.getByRole("link", { name: "Compare two worlds" });
    const scope = page.locator('dl[aria-label="Helios product scope"]');

    await expect(explore).toBeVisible();
    await expect(missions).toBeVisible();
    await expect(compare).toBeVisible();
    await expect(scope).toBeVisible();

    await expectVerticalOrder(explore, missions);
    await expectVerticalOrder(missions, compare);
    await expectVerticalOrder(compare, scope);
    await expectNoHorizontalOverflow(page);
  });
});
