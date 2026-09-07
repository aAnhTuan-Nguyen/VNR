import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

import { chromium } from "playwright";

const host = "127.0.0.1";
const port = 4173;
const url = `http://${host}:${port}/`;
const screenshotPath = path.join(tmpdir(), "party-history-shelf-qa.png");

const browserCandidates = process.platform === "win32"
  ? [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ]
  : [];

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
  || browserCandidates.find((candidate) => existsSync(candidate));

function startPreview() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  return spawn(
    command,
    ["run", "preview", "--", "--host", host, "--port", String(port), "--strictPort"],
    {
      cwd: process.cwd(),
      env: { ...process.env, NO_COLOR: "1" },
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

async function waitForServer(server) {
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite preview exited before becoming ready.\n${output}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 125));
  }

  throw new Error(`Timed out waiting for ${url}.\n${output}`);
}

async function waitForShelfFrame(page) {
  await page.locator('iframe[title="Thư viện 3D - Lịch sử Đảng"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const frame = page.frames().find((candidate) => candidate.url().includes("lich-su-dang-shelf.html"));
    if (frame) return frame;
    await page.waitForTimeout(100);
  }

  throw new Error("Iframe thư viện lịch sử không tải được scene tùy biến.");
}

async function loadShelf(context, viewportName) {
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedResponses = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${message.text()} @ ${message.location().url || "unknown"}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const frame = await waitForShelfFrame(page);
  await frame.locator("canvas#scene").waitFor({ state: "visible", timeout: 15_000 });
  try {
    await frame.waitForFunction(() => document.querySelector("#loading")?.hidden === true, null, { timeout: 30_000 });
  } catch (error) {
    console.error(JSON.stringify({ pageErrors, consoleErrors, failedResponses, loadingText: await frame.locator("#loading").textContent(), fallbackHidden: await frame.locator("#static-fallback").getAttribute("hidden") }, null, 2));
    throw error;
  }

  assert.equal(await page.title(), "Thư viện 3D - Lịch sử Đảng");
  assert.match(await frame.locator("body").innerText(), /BẢY CHẶNG ĐƯỜNG TIÊU BIỂU/i);

  const canvas = await frame.locator("canvas#scene").evaluate((element) => {
    const gl = element.getContext("webgl2") || element.getContext("webgl");
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, webgl: Boolean(gl), version: gl ? gl.getParameter(gl.VERSION) : null };
  });

  assert.equal(canvas.webgl, true, `${viewportName}: WebGL did not initialize`);
  assert.ok(canvas.width > 0 && canvas.height > 0, `${viewportName}: canvas is empty`);
  assert.deepEqual(pageErrors, [], `${viewportName}: page errors: ${pageErrors.join("\n")}`);
  assert.deepEqual(consoleErrors, [], `${viewportName}: console errors: ${consoleErrors.join("\n")}`);
  assert.deepEqual(failedResponses, [], `${viewportName}: failed responses: ${failedResponses.join("\n")}`);

  return { page, frame, canvas };
}

function stopPreview(server) {
  if (server.exitCode !== null || !server.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill("SIGTERM");
  }
}

const server = startPreview();
let browser;

try {
  await waitForServer(server);
  browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-webgl"],
  });

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const desktop = await loadShelf(desktopContext, "desktop");

  await desktop.frame.locator("#next").click();
  await desktop.frame.locator('#inspect[aria-label="Mở Mốc Son 1930"]').waitFor({ timeout: 5_000 });
  await desktop.frame.locator("#inspect").click();
  await desktop.frame.waitForFunction(() => { const experience = document.querySelector("#experience"); return experience?.classList.contains("mode-detail") && !experience.classList.contains("is-opening"); });
  await desktop.frame.locator("#toggle-book").click();
  await desktop.frame.waitForFunction(() => document.querySelector("#toggle-book")?.textContent === "Đóng sách");
  await desktop.frame.locator("#next-page").click();
  await desktop.frame.waitForFunction(() => document.querySelector("#page-counter")?.textContent?.includes("02 / 05"));
  assert.equal(await desktop.frame.locator("#detail-title").textContent(), "Mốc Son 1930");
  assert.match(await desktop.frame.locator("#page-counter").textContent(), /02 \/ 05/);
  await desktop.page.screenshot({ path: screenshotPath, type: "png" });
  await desktopContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const mobile = await loadShelf(mobileContext, "mobile");
  assert.equal(Math.round(mobile.canvas.width), 390);
  assert.equal(Math.round(mobile.canvas.height), 844);
  assert.equal(await mobile.frame.locator("#next").isVisible(), true);
  assert.equal(await mobile.frame.locator("#inspect").isVisible(), true);
  await mobileContext.close();

  console.log(JSON.stringify({
    desktop: { canvas: desktop.canvas, interaction: "chọn Mốc Son 1930, mở sách và lật sang trang 02 / 05" },
    mobile: { canvas: mobile.canvas, controlsVisible: true },
    screenshotPath,
  }, null, 2));
} finally {
  await browser?.close();
  stopPreview(server);
}
