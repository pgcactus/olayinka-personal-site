// Makes each page's share image (og:image) from a screenshot of the page
// itself, so a shared link previews what the page actually looks like.
//
// Run after `pnpm build`:  node scripts/make-og-images.mjs
// Writes client/public/og-<name>.png at 1200×630. Commit the results.
//
// Fonts and album covers are fetched through Node, so they load wherever
// Node has internet. A page whose covers don't load is skipped, keeping its
// existing image, rather than saved with empty sleeves.

import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const port = 4319;
const base = `http://127.0.0.1:${port}`;

// The home image is the drawing and title already; it is made separately.
const PAGES = [
  { route: "/small-things", file: "og-small-things.png" },
  { route: "/nato", file: "og-nato.png" },
  // The half-visible list under the results would look cut off.
  { route: "/pace", file: "og-pace.png", css: "main section{display:none}" },
  { route: "/cards", file: "og-cards.png" },
  { route: "/things/vinyls", file: "og-vinyls.png", needsCovers: true },
];

const server = spawn(process.execPath, ["dist/index.js"], {
  cwd: root,
  env: { ...process.env, NODE_ENV: "production", PORT: String(port) },
  stdio: ["ignore", "ignore", "inherit"],
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

// Serve outside requests (fonts, covers) through Node's fetch.
async function viaNode(route) {
  const request = route.request();
  try {
    const response = await fetch(request.url(), { headers: request.headers() });
    const headers = {};
    response.headers.forEach((value, key) => {
      if (
        !["content-encoding", "content-length", "transfer-encoding"].includes(
          key
        )
      )
        headers[key] = value;
    });
    await route.fulfill({
      status: response.status,
      headers,
      body: Buffer.from(await response.arrayBuffer()),
    });
  } catch {
    await route.abort();
  }
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

try {
  await waitForServer();
  for (const page of PAGES) {
    // A 960×504 view at 1.25× gives a 1200×630 image with readable text.
    const context = await browser.newContext({
      viewport: { width: 960, height: 504 },
      deviceScaleFactor: 1.25,
      reducedMotion: "reduce",
    });
    await context.route(
      /fonts\.(googleapis|gstatic)\.com|mzstatic\.com/,
      viaNode
    );
    const tab = await context.newPage();
    await tab.goto(base + page.route, { waitUntil: "networkidle" });
    await tab.evaluate(() => document.fonts.ready);
    // The page's own view, minus the header buttons and most of the top
    // margin, so the content that matters fits the frame.
    await tab.addStyleTag({
      content:
        ".site-header{display:none!important}main{padding-top:44px!important}" +
        (page.css ?? ""),
    });
    // No focus rings or text selection in the picture.
    await tab.evaluate(() => {
      document.activeElement?.blur?.();
      window.getSelection()?.removeAllRanges();
    });
    await tab.mouse.move(0, 0);

    if (page.needsCovers) {
      const missing = await tab.evaluate(
        () =>
          [...document.images].filter(img => img.src && !img.naturalWidth)
            .length
      );
      if (missing) {
        console.warn(
          `${page.route}: ${missing} cover(s) did not load; keeping ${page.file}.`
        );
        await context.close();
        continue;
      }
    }

    await tab.waitForTimeout(300);
    await tab.screenshot({
      path: path.join(root, "client/public", page.file),
    });
    console.log(`${page.route} → client/public/${page.file}`);
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}
