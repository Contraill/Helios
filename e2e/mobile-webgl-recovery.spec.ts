import { expect, test, type Page } from "@playwright/test";

async function setSyntheticVisibility(
  page: Page,
  state: "hidden" | "visible",
): Promise<void> {
  await page.evaluate((nextState) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => nextState,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

test.describe("mobile WebGL recovery", () => {
  test.use({
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("recovers a lost renderer context without duplicating lifecycle listeners", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/explore?sceneTest=1");

    const shell = page.locator(".solar-canvas-shell");
    await expect(page.locator("html")).toHaveAttribute(
      "data-explore-scene-ready",
      "true",
      { timeout: 45_000 },
    );
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 45_000,
    });
    await expect(shell.locator("canvas")).toHaveCount(1);

    const usedRealLossExtension = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".solar-canvas-shell canvas",
      );
      if (!canvas) throw new Error("Renderer canvas is unavailable.");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      const extension = context?.getExtension("WEBGL_lose_context");
      if (extension) {
        extension.loseContext();
        return true;
      }
      canvas.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
      canvas.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
      return false;
    });
    expect(typeof usedRealLossExtension).toBe("boolean");
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".solar-canvas-shell canvas",
      );
      canvas?.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
    });

    await expect
      .poll(
        async () =>
          Number(await shell.getAttribute("data-webgl-recovery-count")),
        { timeout: 15_000 },
      )
      .toBe(1);
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 20_000,
    });
    await expect(shell.locator("canvas")).toHaveCount(1);

    const firstRecoveryCount = Number(
      await shell.getAttribute("data-webgl-recovery-count"),
    );
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".solar-canvas-shell canvas",
      );
      if (!canvas) throw new Error("Recovered renderer canvas is unavailable.");
      canvas.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
    });

    await expect
      .poll(
        async () =>
          Number(await shell.getAttribute("data-webgl-recovery-count")),
        { timeout: 15_000 },
      )
      .toBe(firstRecoveryCount + 1);
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 20_000,
    });
    await expect(shell.locator("canvas")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute(
      "data-explore-scene-ready",
      "true",
    );
  });

  test("offers a manual retry when the initial detached WebGL probe fails", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      const rejectedProbeCanvases = new WeakSet<HTMLCanvasElement>();
      let initialDetachedProbeRejected = false;

      HTMLCanvasElement.prototype.getContext = function getContext(
        this: HTMLCanvasElement,
        contextId: string,
        options?: unknown,
      ) {
        if (
          !this.isConnected &&
          (contextId === "webgl" || contextId === "webgl2")
        ) {
          if (!initialDetachedProbeRejected) {
            rejectedProbeCanvases.add(this);
            initialDetachedProbeRejected = true;
          }
          if (rejectedProbeCanvases.has(this)) return null;
        }
        return Reflect.apply(originalGetContext, this, [contextId, options]);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    await page.goto("/explore?sceneTest=1");
    const shell = page.locator(".solar-canvas-shell");
    await expect(shell).toHaveAttribute(
      "data-webgl-availability",
      "unavailable",
      { timeout: 15_000 },
    );
    const retry = page.getByRole("button", { name: /try again|tekrar dene/i });
    await expect(retry).toBeVisible();
    await retry.click();

    await expect(shell).toHaveAttribute(
      "data-webgl-availability",
      "available",
      {
        timeout: 20_000,
      },
    );
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 45_000,
    });
    await expect(shell.locator("canvas")).toHaveCount(1);
  });

  test("defers a hidden-tab context recovery until the page is visible", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/explore?sceneTest=1");

    const shell = page.locator(".solar-canvas-shell");
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 45_000,
    });
    await expect(shell.locator("canvas")).toHaveCount(1);

    await setSyntheticVisibility(page, "hidden");
    await expect(shell).toHaveAttribute("data-document-visibility", "hidden");
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".solar-canvas-shell canvas",
      );
      if (!canvas) throw new Error("Renderer canvas is unavailable.");
      canvas.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
      canvas.dispatchEvent(
        new Event("webglcontextlost", { bubbles: false, cancelable: true }),
      );
    });

    await expect(shell).toHaveAttribute("data-webgl-context", "lost");
    await expect(shell).toHaveAttribute("data-webgl-recovery-count", "1");

    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        ".solar-canvas-shell canvas",
      );
      canvas?.dispatchEvent(new Event("webglcontextrestored"));
    });
    await expect(shell).toHaveAttribute("data-webgl-context", "recovering");
    await expect(shell).toHaveAttribute("data-webgl-stability", "deferred");
    await page.waitForTimeout(1_600);
    await expect(shell).toHaveAttribute("data-webgl-context", "recovering");
    await expect(shell.locator("canvas")).toHaveCount(1);

    await setSyntheticVisibility(page, "visible");
    await expect(shell).toHaveAttribute("data-document-visibility", "visible");
    await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
      timeout: 20_000,
    });
    await expect(shell).toHaveAttribute("data-webgl-stability", "probation");
    await expect(shell).toHaveAttribute("data-webgl-recovery-attempt", "1");
    await expect(shell).toHaveAttribute("data-webgl-recovery-count", "1");
    await expect(shell.locator("canvas")).toHaveCount(1);

    await page.waitForTimeout(1_200);
    await setSyntheticVisibility(page, "hidden");
    await page.waitForTimeout(10_500);
    await expect(shell).toHaveAttribute("data-webgl-stability", "probation");
    await expect(shell).toHaveAttribute("data-webgl-recovery-attempt", "1");

    await setSyntheticVisibility(page, "visible");
    await expect(shell).toHaveAttribute("data-webgl-stability", "probation");
    await page.waitForTimeout(10_500);
    await expect(shell).toHaveAttribute("data-webgl-stability", "settled");
    await expect(shell).toHaveAttribute("data-webgl-recovery-attempt", "0");
    await expect(shell.locator("canvas")).toHaveCount(1);
  });
});
