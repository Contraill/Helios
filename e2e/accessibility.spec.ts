import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const auditedRoutes = [
  "/",
  "/explore",
  "/planet/earth",
  "/compare?a=earth&b=mars",
  "/data",
] as const;

for (const route of auditedRoutes) {
  test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations,
      results.violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length})`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}

test("system reduced motion removes continuous scene motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/explore");

  await expect(
    page.getByRole("region", {
      name: "Static exploration-scale model of the Sun and the eight planets",
    }),
  ).toBeVisible();
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-render-loop",
    "demand",
  );
});

test("a hidden Explore document switches the renderer to demand mode", async ({
  page,
}) => {
  await page.goto("/explore");
  const shell = page.locator(".solar-canvas-shell");
  await expect(shell).toHaveAttribute("data-render-loop", "continuous");

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(shell).toHaveAttribute("data-render-loop", "demand");
});

test("keyboard focus remains visible and Escape restores the triggering planet", async ({
  page,
}) => {
  await page.goto("/explore");
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name: /Sun & planets/i }).click();
  const earth = page.getByRole("button", { name: "Earth", exact: true });
  await earth.focus();
  const focusPresentation = await earth.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(
    focusPresentation.outlineStyle !== "none" ||
      focusPresentation.outlineWidth !== "0px" ||
      focusPresentation.boxShadow !== "none",
  ).toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(earth).toBeFocused();
});

test.describe("200 percent layout equivalent", () => {
  test.use({ viewport: { height: 500, width: 720 } });

  for (const route of ["/explore", "/planet/earth", "/data"] as const) {
    test(`${route} does not create horizontal document overflow`, async ({
      page,
    }) => {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth,
      );
    });
  }
});

test("repeated Explore route transitions leave one canvas and no page errors", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/explore");
  for (let visit = 0; visit < 3; visit += 1) {
    await page.getByRole("link", { name: "Helios", exact: true }).click();
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.getByRole("link", { name: "Explore", exact: true }).click();
    await expect(page.locator("canvas")).toHaveCount(1);
  }

  expect(pageErrors).toEqual([]);
});

test("browser history reuses Explore without accumulating live canvases", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/explore");
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("link", { name: "Helios", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(0);

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.goBack();
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.goForward();
    await expect(page.locator("canvas")).toHaveCount(0);
  }

  expect(pageErrors).toEqual([]);
});
