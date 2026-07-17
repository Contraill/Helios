import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Helios" },
  { path: "/explore", heading: "Explore" },
  { path: "/planet/mars", heading: "Mars" },
  { path: "/compare", heading: "Compare" },
  { path: "/data", heading: "Data" },
  { path: "/about", heading: "About" },
  { path: "/case-study", heading: "Case study" },
] as const;

for (const route of routes) {
  test(`${route.path} renders its h1`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      route.heading,
    );
  });
}

test("unknown planet slugs return the not-found page", async ({ page }) => {
  const response = await page.goto("/planet/pluto");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("the health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { status: string };
  expect(body.status).toBe("ok");
});

test("the skip link is the first focusable element and targets main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
});
