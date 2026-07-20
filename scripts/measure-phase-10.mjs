import { spawn } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import { brotliCompressSync, gzipSync } from "node:zlib";

import { chromium } from "@playwright/test";

const ROOT = new URL("../", import.meta.url);
const PORT = Number(process.env.PHASE_10_PORT ?? 3102);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

if (!executablePath) {
  throw new Error("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is required");
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Production server did not become ready");
}

async function compressedFileMetrics(relativePath) {
  const path = new URL(`../.next/${relativePath}`, import.meta.url);
  const contents = await readFile(path);
  return {
    brotliBytes: brotliCompressSync(contents).byteLength,
    gzipBytes: gzipSync(contents).byteLength,
    path: relativePath,
    rawBytes: (await stat(path)).size,
  };
}

async function bundleMetrics() {
  const buildManifest = JSON.parse(
    await readFile(new URL("../.next/build-manifest.json", import.meta.url)),
  );
  const loadableManifest = JSON.parse(
    await readFile(
      new URL(
        "../.next/server/app/explore/page/react-loadable-manifest.json",
        import.meta.url,
      ),
    ),
  );
  const rootFiles = [
    ...buildManifest.polyfillFiles,
    ...buildManifest.rootMainFiles,
  ];
  const explore3dFiles = [
    ...new Set(
      Object.values(loadableManifest).flatMap((entry) => entry.files ?? []),
    ),
  ];
  return {
    explore3d: await Promise.all(
      explore3dFiles.map((file) => compressedFileMetrics(file)),
    ),
    root: await Promise.all(
      rootFiles.map((file) => compressedFileMetrics(file)),
    ),
  };
}

function sumMetrics(files) {
  return files.reduce(
    (totals, file) => ({
      brotliBytes: totals.brotliBytes + file.brotliBytes,
      gzipBytes: totals.gzipBytes + file.gzipBytes,
      rawBytes: totals.rawBytes + file.rawBytes,
    }),
    { brotliBytes: 0, gzipBytes: 0, rawBytes: 0 },
  );
}

async function frameSample(page, durationMs = 4_000) {
  return page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        const deltas = [];
        const longTasks = [];
        let previous;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) longTasks.push(entry.duration);
        });
        try {
          observer.observe({ entryTypes: ["longtask"] });
        } catch {}
        const startedAt = performance.now();

        const tick = (now) => {
          if (previous !== undefined) deltas.push(now - previous);
          previous = now;
          if (now - startedAt < duration) {
            requestAnimationFrame(tick);
            return;
          }
          observer.disconnect();
          const sorted = [...deltas].sort((a, b) => a - b);
          const percentile = (value) =>
            sorted[
              Math.min(sorted.length - 1, Math.floor(sorted.length * value))
            ] ?? 0;
          resolve({
            averageFps:
              deltas.length /
              (deltas.reduce((total, value) => total + value, 0) / 1_000),
            frames: deltas.length,
            framesOver20ms: deltas.filter((value) => value > 20).length,
            framesOver33ms: deltas.filter((value) => value > 33.33).length,
            longTaskCount: longTasks.length,
            longTaskTotalMs: longTasks.reduce(
              (total, value) => total + value,
              0,
            ),
            p50FrameMs: percentile(0.5),
            p95FrameMs: percentile(0.95),
          });
        };
        requestAnimationFrame(tick);
      }),
    durationMs,
  );
}

async function runtimeMetrics(browser) {
  const context = await browser.newContext({
    viewport: { height: 1_000, width: 1_440 },
  });
  const page = await context.newPage();
  const errors = [];
  const requestedPaths = [];
  page.on("request", (request) => {
    requestedPaths.push(new URL(request.url()).pathname);
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle" });
  await page.locator(".solar-canvas-shell").waitFor();
  await page.locator(".solar-canvas-shell").evaluate((element) => {
    if (element.getAttribute("data-visual-contract") !== "high") {
      throw new Error("Expected automatic high visual contract");
    }
  });
  await page.getByRole("button", { name: "Saturn", exact: true }).click();
  await page.waitForTimeout(1_200);

  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.collectGarbage");
  const performanceMetrics = await cdp.send("Performance.getMetrics");
  const domCounters = await cdp.send("Memory.getDOMCounters");
  const metrics = Object.fromEntries(
    performanceMetrics.metrics.map(({ name, value }) => [name, value]),
  );
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => {
        const resource = entry;
        return {
          decodedBodyBytes: resource.decodedBodySize,
          initiatorType: resource.initiatorType,
          path: new URL(resource.name).pathname,
          transferBytes: resource.transferSize,
        };
      })
      .filter(
        ({ path }) =>
          path.startsWith("/_next/") || path.startsWith("/textures/"),
      ),
  );
  const frame = await frameSample(page);
  const resourceTotals = (paths) => ({
    decodedBytes: paths.reduce(
      (total, resource) => total + resource.decodedBodyBytes,
      0,
    ),
    transferBytes: paths.reduce(
      (total, resource) => total + resource.transferBytes,
      0,
    ),
  });
  const scripts = resources.filter(({ path }) => path.endsWith(".js"));
  const styles = resources.filter(({ path }) => path.endsWith(".css"));
  const textures = resources.filter(({ path }) =>
    path.startsWith("/textures/"),
  );

  await context.close();
  return {
    dom: domCounters,
    errors,
    frame,
    heap: {
      jsHeapUsedBytes: metrics.JSHeapUsedSize,
      jsHeapTotalBytes: metrics.JSHeapTotalSize,
      jsEventListeners: metrics.JSEventListeners,
      nodes: metrics.Nodes,
    },
    network: {
      apiPaths: requestedPaths.filter((path) => path.startsWith("/api/")),
      all: resourceTotals(resources),
      duplicateTexturePaths: [
        ...new Set(
          textures
            .map(({ path }) => path)
            .filter((path, index, paths) => paths.indexOf(path) !== index),
        ),
      ],
      scripts: resourceTotals(scripts),
      styles: resourceTotals(styles),
      texturePaths: textures.map(({ path }) => path).sort(),
      textures: resourceTotals(textures),
    },
    quality,
  };
}

async function homeRouteMetrics(browser, explore3dFiles) {
  const context = await browser.newContext({
    viewport: { height: 1_000, width: 1_440 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3_000);
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => {
      const resource = entry;
      return {
        path: new URL(resource.name).pathname,
        transferBytes: resource.transferSize,
      };
    }),
  );
  const scriptTransferBytes = resources
    .filter(({ path }) => path.endsWith(".js"))
    .reduce((total, { transferBytes }) => total + transferBytes, 0);
  const loadedPaths = resources.map(({ path }) => path);
  const result = {
    errors,
    explore3dChunkLoaded: explore3dFiles.some((file) =>
      loadedPaths.some((path) => path.endsWith(file.split("/").at(-1))),
    ),
    scriptTransferBytes,
    texturePaths: loadedPaths.filter((path) => path.startsWith("/textures/")),
  };
  await context.close();
  return result;
}

async function memorySnapshot(context, page) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.collectGarbage");
  const [{ metrics }, dom] = await Promise.all([
    cdp.send("Performance.getMetrics"),
    cdp.send("Memory.getDOMCounters"),
  ]);
  const values = Object.fromEntries(
    metrics.map(({ name, value }) => [name, value]),
  );
  await cdp.detach();
  return {
    canvasCount: await page.locator("canvas").count(),
    documents: dom.documents,
    jsEventListeners: values.JSEventListeners,
    jsHeapUsedBytes: values.JSHeapUsedSize,
    nodes: dom.nodes,
  };
}

async function routeLifecycleMetrics(browser, explore3dFiles) {
  const target = process.env.PHASE_10_LIFECYCLE_TARGET ?? "explore";
  const targetName = target === "compare" ? "Compare" : "Explore";
  const context = await browser.newContext({
    viewport: { height: 1_000, width: 1_440 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);
  const initialResources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => new URL(entry.name).pathname),
  );
  const homeBefore = await memorySnapshot(context, page);
  const dynamicChunkOnInitialHome = explore3dFiles.some((file) =>
    initialResources.some((path) => path.endsWith(file.split("/").at(-1))),
  );

  const visits = [];
  for (let visit = 1; visit <= 3; visit += 1) {
    await page.getByRole("link", { name: targetName, exact: true }).click();
    if (target === "explore") {
      await page.locator("canvas").waitFor();
      await page.getByRole("button", { name: "Saturn", exact: true }).click();
    } else {
      await page.getByRole("heading", { level: 1, name: "Compare" }).waitFor();
    }
    await page.waitForTimeout(1_000);
    const explore = await memorySnapshot(context, page);

    await page.getByRole("link", { name: "Helios", exact: true }).click();
    await page.locator("canvas").waitFor({ state: "detached" });
    await page.waitForTimeout(6_000);
    const homeAfterCacheExpiry = await memorySnapshot(context, page);
    visits.push({ explore, homeAfterCacheExpiry, visit });
  }
  await context.close();
  return {
    dynamicChunkOnInitialHome,
    errors,
    homeBefore,
    initialHomeTextureRequests: initialResources.filter((path) =>
      path.startsWith("/textures/"),
    ),
    target,
    visits,
  };
}

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
  { cwd: ROOT, env: process.env, stdio: "ignore" },
);

try {
  await waitForServer();
  const bundle = await bundleMetrics();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--headless=shell",
    ],
  });
  const qualities = [];
  const home = await homeRouteMetrics(
    browser,
    bundle.explore3d.map(({ path }) => path),
  );
  if (process.env.PHASE_10_LIFECYCLE_ONLY !== "1") {
    for (const quality of ["low", "medium", "high"]) {
      qualities.push(await runtimeMetrics(browser, quality));
    }
  }
  const lifecycle =
    process.env.PHASE_10_SKIP_LIFECYCLE === "1"
      ? null
      : await routeLifecycleMetrics(
          browser,
          bundle.explore3d.map(({ path }) => path),
        );
  await browser.close();
  const report = `${JSON.stringify(
    {
      browser: "Chromium 149 headless shell with SwiftShader",
      bundle: {
        ...bundle,
        explore3dTotal: sumMetrics(bundle.explore3d),
        rootTotal: sumMetrics(bundle.root),
      },
      measuredAt: new Date().toISOString(),
      home,
      lifecycle,
      node: process.version,
      qualities,
      viewport: "1440x1000",
    },
    null,
    2,
  )}\n`;
  if (process.env.PHASE_10_OUTPUT) {
    await writeFile(process.env.PHASE_10_OUTPUT, report, "utf8");
  } else {
    process.stdout.write(report);
  }
} finally {
  server.kill("SIGTERM");
}
