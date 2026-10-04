import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pages = [
  ["dist/public/index.html", "Right now, I lead product work at"],
  ["dist/public/nato/index.html", "NATO Phonetic Alphabet"],
  ["dist/public/pace/index.html", "Pace calculator"],
  ["dist/public/cards/index.html", "Find the card"],
  ["dist/public/small-things/index.html", "Small things"],
  ["dist/public/things/vinyls/index.html", "For Broken Ears"],
];

function occurrences(value, fragment) {
  return value.split(fragment).length - 1;
}

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

for (const [relativePath, expectedContent] of pages) {
  const html = await read(relativePath);
  assert.equal(occurrences(html, 'id="root"'), 1, `${relativePath}: root`);
  assert.equal(occurrences(html, "<main"), 1, `${relativePath}: main`);
  assert.equal(occurrences(html, "<title"), 1, `${relativePath}: title`);
  assert.equal(
    occurrences(html, 'name="description"'),
    1,
    `${relativePath}: description`
  );
  assert.match(html, new RegExp(expectedContent), `${relativePath}: content`);
  assert.doesNotMatch(
    html,
    /data-loc=|manus-runtime|__manus__|%VITE_|30-second previews|data:image/
  );
}

// React does not hoist inline scripts, so the JSON-LD must stay inside #root
// or hydration fails.
const homeHtml = await read("dist/public/index.html");
const homeTitle = homeHtml.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
assert.ok(
  homeTitle.length >= 30 && homeTitle.length <= 60,
  `index.html: title length (${homeTitle.length})`
);
const homeKeywords =
  homeHtml
    .match(/<meta name="keywords" content="([^"]+)"/)?.[1]
    .split(",")
    .map(keyword => keyword.trim())
    .filter(Boolean) ?? [];
assert.ok(
  homeKeywords.length >= 3 && homeKeywords.length <= 8,
  `index.html: keyword count (${homeKeywords.length})`
);
assert.match(
  homeHtml,
  /<h2\b[^>]*>[^<]{1,80}<\/h2>/,
  "index.html: descriptive H2"
);
assert.ok(
  homeHtml.indexOf("application/ld+json") > homeHtml.indexOf('id="root"'),
  "index.html: JSON-LD inside #root"
);

// Places is retired: it redirects and stays out of the sitemap.
const sitemap = await read("dist/public/sitemap.xml");
assert.doesNotMatch(sitemap, /things\/places/, "sitemap: places");

// Each page shares its own preview image.
for (const [page, image] of [
  ["dist/public/index.html", "/og.png"],
  ["dist/public/small-things/index.html", "/og-small-things.png"],
  ["dist/public/nato/index.html", "/og-nato.png"],
  ["dist/public/pace/index.html", "/og-pace.png"],
  ["dist/public/cards/index.html", "/og-cards.png"],
  ["dist/public/things/vinyls/index.html", "/og-vinyls.png"],
]) {
  const html = await read(page);
  assert.match(
    html,
    new RegExp(`property="og:image" content="https://olayinka.xyz${image}"`),
    `${page}: og:image`
  );
  await read(`dist/public${image}`);
}

const notFoundHtml = await read("dist/public/404.html");
assert.match(notFoundHtml, /Page not found\./);
assert.match(notFoundHtml, /<meta name="robots" content="noindex"/);

const port = 4317;
const server = spawn(process.execPath, ["dist/index.js"], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Production server did not start");
}

try {
  await waitForServer();

  const routeChecks = [
    ["/", 200, "Right now, I lead product work at"],
    ["/nato", 200, "NATO Phonetic Alphabet"],
    ["/pace", 200, "Pace calculator"],
    ["/cards", 200, "Find the card"],
    ["/small-things", 200, "Small things"],
    ["/things/books", 308, ""],
    ["/things/vinyls/", 200, "For Broken Ears"],
    ["/things/places", 308, ""],
    ["/missing", 404, "Page not found."],
  ];

  for (const [route, expectedStatus, expectedContent] of routeChecks) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      redirect: "manual",
    });
    assert.equal(response.status, expectedStatus, `${route}: status`);
    assert.match(await response.text(), new RegExp(expectedContent));
  }

  const redirect = await fetch(`http://127.0.0.1:${port}/things`, {
    redirect: "manual",
  });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "/things/vinyls");

  for (const retired of ["/things/books", "/things/places"]) {
    const response = await fetch(`http://127.0.0.1:${port}${retired}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 308, `${retired}: status`);
    assert.equal(
      response.headers.get("location"),
      "/things/vinyls",
      `${retired}: location`
    );
  }

  const home = await fetch(`http://127.0.0.1:${port}/`);
  assert.match(
    home.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/
  );
  assert.match(
    home.headers.get("content-security-policy") ?? "",
    /media-src https:\/\/audio-ssl\.itunes\.apple\.com/,
    "CSP allows Apple Music previews"
  );
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
} finally {
  server.kill("SIGTERM");
}

console.log("Production build validation passed.");
