import { expect, test } from "@playwright/test";

test.skip(
  !process.env.HELIOS_LIVE_NASA_MEDIA,
  "Run with HELIOS_LIVE_NASA_MEDIA=1 to check NASA hosts.",
);

for (const path of ["/", "/planet/earth", "/planet/mars"]) {
  test(`${path} loads its real NASA images`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(path);
    const images = page.locator("img[data-remote-media]");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    await images.evaluateAll((items) => {
      items.forEach((item) => ((item as HTMLImageElement).loading = "eager"));
    });

    await expect
      .poll(
        () =>
          images.evaluateAll(
            (items, expected) =>
              items.length === expected &&
              items.every(
                (item) =>
                  item.getAttribute("src")?.startsWith("https://") &&
                  (item as HTMLImageElement).naturalWidth > 0,
              ),
            count,
          ),
        { timeout: 60_000 },
      )
      .toBe(true);
  });
}
