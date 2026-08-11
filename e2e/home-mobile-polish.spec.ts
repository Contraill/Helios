import { expect, test } from "@playwright/test";

test.describe("home and Mercury mobile polish", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("keeps the home actions above the scope ledger and removes the site footer", async ({
    page,
  }) => {
    await page.goto("/");

    const actions = page.locator("[data-home-actions]");
    const scope = page.locator("[data-home-scope]");
    await expect(actions).toBeVisible();
    await expect(scope).toBeVisible();
    const actionBox = await actions.boundingBox();
    const scopeBox = await scope.boundingBox();
    expect(actionBox).not.toBeNull();
    expect(scopeBox).not.toBeNull();
    if (actionBox && scopeBox) {
      expect(
        scopeBox.y - (actionBox.y + actionBox.height),
      ).toBeGreaterThanOrEqual(8);
    }

    await expect(page.locator("[data-site-footer]")).toHaveCount(0);
    await expect(page.getByText(/A portfolio project by/i)).toHaveCount(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps the home hero ordered at the narrow 320px breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");

    const actions = page.locator("[data-home-actions]");
    const scope = page.locator("[data-home-scope]");
    const actionBox = await actions.boundingBox();
    const scopeBox = await scope.boundingBox();
    expect(actionBox).not.toBeNull();
    expect(scopeBox).not.toBeNull();
    if (actionBox && scopeBox) {
      expect(scopeBox.y).toBeGreaterThanOrEqual(
        actionBox.y + actionBox.height + 8,
      );
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("uses a soft Mercury field without mobile horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/body/mercury");

    const pageRoot = page.locator('[data-planet-page][data-planet="mercury"]');
    const visual = page.locator(
      '[data-planet="mercury"][data-planet-visual="true"]',
    );
    const field = visual.locator("[data-planet-visual-field]");
    await expect(pageRoot).toBeVisible();
    await expect(visual).toBeVisible();
    await expect(field).toBeVisible();
    const background = await field.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(background).toContain("radial-gradient");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
