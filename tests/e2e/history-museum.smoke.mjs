import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const host = "127.0.0.1";
const port = 4173;
const url = `http://${host}:${port}/`;
const screenshotPath = "C:\\Users\\LENOVO\\.codex\\visualizations\\2026\\09\\02\\01a06225-792c-77b1-b1fc-9ea2cd13d0de\\museum-implementation.png";
const shelfSelector = 'iframe[title="Working Volumes — Seven Tools for Making"]';

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
  return spawn(command, ["run", "preview", "--", "--host", host, "--port", String(port), "--strictPort"], {
    cwd: process.cwd(),
    env: { ...process.env, NO_COLOR: "1" },
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForServer(server) {
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite preview exited early.\n${output}`);
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

function stopPreview(server) {
  if (server.exitCode !== null || !server.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill("SIGTERM");
}

async function openArchive(page) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator(shelfSelector).waitFor();
  await page.getByTestId("history-archive-trigger").click();
  await page.getByTestId("archive-chapter-preparation").waitFor();
}

async function collectPage(page, label) {
  const pageErrors = [];
  const consoleErrors = [];
  const failedResponses = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await openArchive(page);
  await page.getByTestId("archive-chapter-reunification").click();
  await page.getByRole("heading", { name: /giải phóng và thống nhất/i }).waitFor();
  await page.locator(".archive-media-card").first().click();
  const lightbox = page.locator(".archive-lightbox").getByRole("dialog");
  await lightbox.waitFor();
  assert.match(await lightbox.innerText(), /tư liệu|giấy phép/i);
  await page.getByRole("button", { name: "Đóng tư liệu" }).click();
  await page.getByRole("button", { name: /nguồn & giấy phép/i }).click();
  await page.getByRole("heading", { name: /để ký ức/i }).waitFor();
  await page.screenshot({ path: screenshotPath, type: "png" });

  const shelf = page.frameLocator(shelfSelector);
  await shelf.locator("#scene").waitFor();
  const canvas = await shelf.locator("#scene").evaluate((element) => {
    const gl = element.getContext("webgl2") || element.getContext("webgl");
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, webgl: Boolean(gl) };
  });
  assert.ok(canvas.width > 0 && canvas.height > 0, `${label}: canvas is empty`);
  assert.deepEqual(pageErrors, [], `${label}: page errors: ${pageErrors.join("\n")}`);
  assert.deepEqual(consoleErrors, [], `${label}: console errors: ${consoleErrors.join("\n")}`);
  assert.deepEqual(failedResponses, [], `${label}: failed responses: ${failedResponses.join("\n")}`);
  return canvas;
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
  const desktopCanvas = await collectPage(await desktopContext.newPage(), "desktop");
  await desktopContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const mobilePage = await mobileContext.newPage();
  await openArchive(mobilePage);
  await mobilePage.getByTestId("archive-chapter-integration").click({ force: true });
  assert.equal(await mobilePage.getByTestId("archive-chapter-integration").isVisible(), true);
  assert.equal(await mobilePage.locator(".archive-media-card").first().isVisible(), true);
  await mobileContext.close();

  const fallbackContext = await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce" });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.addInitScript(() => {
    Object.defineProperty(window, "WebGLRenderingContext", { configurable: true, value: undefined });
  });
  await fallbackPage.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const fallbackShelf = fallbackPage.frameLocator(shelfSelector);
  const fallbackCanvas = fallbackShelf.locator("#scene");
  await fallbackCanvas.waitFor();
  await fallbackShelf.locator("#experience.webgl-ready").waitFor();
  await fallbackCanvas.dispatchEvent("webglcontextlost");
  await fallbackShelf.locator(".static-fallback").waitFor({ state: "visible" });
  assert.match(await fallbackShelf.locator(".static-fallback").innerText(), /static catalog|complete catalog/i);
  await fallbackContext.close();

  console.log(JSON.stringify({ desktop: desktopCanvas, mobile: "history archive + media rail visible", fallback: "ThreeUI static catalog visible" }, null, 2));
} finally {
  await browser?.close();
  stopPreview(server);
}



