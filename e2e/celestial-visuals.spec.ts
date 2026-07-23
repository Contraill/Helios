import { expect, test, type Page } from "@playwright/test";

async function catalogueSnapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__ ?? null);
}

async function openCatalogue(
  page: Page,
  mode: "moons" | "dwarf-systems" | "asteroids" | "dwarf-kuiper" | "comets",
  pageNumber = 1,
) {
  await page.goto(`/explore?sceneTest=1&catalogue=${mode}&page=${pageNumber}`);
  await expect
    .poll(
      async () => (await catalogueSnapshot(page))?.catalogue.enabled ?? false,
      { timeout: 30_000 },
    )
    .toBe(true);
  await expect
    .poll(async () => (await catalogueSnapshot(page))?.catalogue.mode ?? null)
    .toBe(mode);
}

test("test-only visual catalogue renders complete curated groups", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const expected = {
    moons: 22,
    "dwarf-systems": 15,
    asteroids: 4,
    "dwarf-kuiper": 8,
    comets: 6,
  } as const;

  for (const mode of Object.keys(expected) as Array<keyof typeof expected>) {
    await openCatalogue(page, mode);
    const first = await catalogueSnapshot(page);
    expect(first?.catalogue.totalCount).toBe(expected[mode]);
    expect(first?.catalogue.tileCount).toBeLessThanOrEqual(8);
    const bodyIds = [...(first?.catalogue.bodyIds ?? [])];
    const pageCount = first?.catalogue.pageCount ?? 1;
    for (let pageNumber = 2; pageNumber <= pageCount; pageNumber += 1) {
      await openCatalogue(page, mode, pageNumber);
      const snapshot = await catalogueSnapshot(page);
      expect(snapshot?.catalogue.page).toBe(pageNumber);
      expect(snapshot?.catalogue.totalCount).toBe(expected[mode]);
      expect(snapshot?.catalogue.tileCount).toBeLessThanOrEqual(8);
      bodyIds.push(...(snapshot?.catalogue.bodyIds ?? []));
    }
    expect(bodyIds).toHaveLength(expected[mode]);
    expect(new Set(bodyIds).size).toBe(expected[mode]);
  }

  expect(pageErrors).toEqual([]);
});

test("secondary visual failure remains object-local and final surfaces replace fallbacks", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.route("**/textures/celestial/moon-jupiter-europa.webp", (route) =>
    route.abort("failed"),
  );
  await openCatalogue(page, "moons");

  await expect
    .poll(
      async () => {
        const scene = await catalogueSnapshot(page);
        return {
          europaStatus: scene?.textureReadiness.find((entry) =>
            entry.path.endsWith("moon-jupiter-europa.webp"),
          )?.status,
          ioSurface: scene?.surfaces["moon-jupiter-io"] ?? null,
        };
      },
      { timeout: 30_000 },
    )
    .toEqual({
      europaStatus: "error",
      ioSurface: expect.stringContaining(
        "/textures/celestial/moon-jupiter-io.webp",
      ),
    });

  const failed = await catalogueSnapshot(page);
  expect(failed?.catalogue.totalCount).toBe(22);
  expect(failed?.catalogue.tileCount).toBe(8);
  expect(failed?.surfaces["moon-jupiter-europa"]).toBeNull();
  expect(failed?.surfaces["moon-jupiter-io"]).toContain(
    "/textures/celestial/moon-jupiter-io.webp",
  );
});
