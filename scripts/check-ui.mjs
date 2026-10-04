// Browser checks for the built site: layout at the eight AGENTS.md screen
// sizes in English and French, and an axe-core WCAG 2.2 AA audit. Run after
// `pnpm build`. Screenshots go to ui-screenshots/ for a human to look at.
//
// What it guards against, from bugs seen on this site:
// - the page scrolling sideways at any size;
// - the home page not fitting one screen;
// - the drawing overlapping the title, or the header overlapping either;
// - opening a home card moving anything on the page;
// - accessibility regressions.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const port = 4318;
const base = `http://127.0.0.1:${port}`;
const outDir = path.join(root, "ui-screenshots");

const VIEWPORTS = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1280, 720],
  [768, 1024],
  [390, 844],
  [375, 667],
  [320, 568],
];
const PAGES = [
  "/",
  "/small-things",
  "/nato",
  "/pace",
  "/things/vinyls",
  "/missing",
];
const CARDS = ["flatiron", "things", "records"];
// The home page may scroll on screens shorter than this.
const MIN_ONE_SCREEN_HEIGHT = 667;

// A 1×1 cover stands in for Apple's CDN, so runs don't depend on it.
const COVER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

const server = spawn(process.execPath, ["dist/index.js"], {
  cwd: root,
  env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(`${base}/`)).ok) return;
    } catch {
      // Still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Production server did not start");
}

const axeSource = await readFile(
  path.join(root, "node_modules/axe-core/axe.min.js"),
  "utf8"
);

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

async function openPage(width, height, lang) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
    // The page's CSP blocks injected scripts; axe needs to run.
    bypassCSP: true,
  });
  await context.addInitScript(value => {
    window.localStorage.setItem("lang", value);
  }, lang);
  await context.route(/mzstatic\.com/, route =>
    route.fulfill({ status: 200, contentType: "image/png", body: COVER })
  );
  const page = await context.newPage();
  page.on("pageerror", error =>
    failures.push(`${width}×${height} ${lang}: page error: ${error.message}`)
  );
  return { context, page };
}

const box = (page, selector) => page.locator(selector).first().boundingBox();

function overlaps(a, b) {
  return (
    a &&
    b &&
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

try {
  await waitForServer();
  await mkdir(outDir, { recursive: true });

  for (const [width, height] of VIEWPORTS) {
    for (const lang of ["en", "fr"]) {
      const label = `${width}×${height} ${lang}`;
      const { context, page } = await openPage(width, height, lang);

      for (const route of PAGES) {
        await page.goto(base + route, { waitUntil: "networkidle" });
        await settle(page);
        const name =
          route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
        await page.screenshot({
          path: path.join(outDir, `${name}-${width}x${height}-${lang}.png`),
        });

        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth
        );
        check(
          scrollWidth <= width + 1,
          `${label} ${route}: scrolls sideways (${scrollWidth}px wide)`
        );
      }

      // Home: one screen, drawing above the words, header clear of both.
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await settle(page);
      const restHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      if (height >= MIN_ONE_SCREEN_HEIGHT) {
        check(
          restHeight <= height + 1,
          `${label} home: taller than the screen (${restHeight}px)`
        );
      }
      const art = await box(page, ".hm-art");
      const title = await box(page, ".hm-title");
      const header = await box(page, ".hm-actions");
      check(
        art && title && art.y + art.height <= title.y + 1,
        `${label} home: drawing overlaps the title`
      );
      check(
        !overlaps(header, title) && !overlaps(header, art),
        `${label} home: header overlaps the drawing or title`
      );

      // Opening a card never moves the page.
      for (const key of CARDS) {
        await page.locator(`[data-key="${key}"]`).first().click();
        await page.waitForTimeout(150);
        const openHeight = await page.evaluate(
          () => document.documentElement.scrollHeight
        );
        const titleNow = await box(page, ".hm-title");
        check(
          openHeight === restHeight && titleNow?.y === title?.y,
          `${label} home: opening "${key}" moved the page`
        );
        await page.screenshot({
          path: path.join(outDir, `home-${key}-${width}x${height}-${lang}.png`),
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(150);
      }

      await context.close();
    }
  }

  // Accessibility: WCAG 2.2 AA on every page, desktop and phone.
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const { context, page } = await openPage(width, height, "en");
    for (const route of PAGES) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await settle(page);
      await page.addScriptTag({ content: axeSource });
      const results = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        })
      );
      for (const violation of results.violations) {
        failures.push(
          `${width}×${height} ${route}: axe ${violation.id}: ${violation.help} (${violation.nodes
            .slice(0, 3)
            .map(node => node.target.join(" "))
            .join(", ")})`
        );
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(`UI checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
}
assert.equal(failures.length, 0, "UI checks failed");
console.log(
  `UI checks passed. Screenshots in ${path.relative(root, outDir)}/.`
);
