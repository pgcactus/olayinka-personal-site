import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pages = [
  ["dist/public/index.html", "Hi, I&#x27;m Olayinka."],
  ["dist/public/nato/index.html", "NATO Phonetic Alphabet"],
  ["dist/public/things/books/index.html", "Playing to Win"],
  ["dist/public/things/vinyls/index.html", "For Broken Ears"],
  ["dist/public/things/places/index.html", "Countries visited"],
  ["dist/public/404/index.html", "Page not found."],
  ["dist/public/404.html", "Page not found."],
];

function occurrences(value, fragment) {
  return value.split(fragment).length - 1;
}

for (const [relativePath, expectedContent] of pages) {
  const html = await readFile(path.join(root, relativePath), "utf8");
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
    /data-loc=|manus-runtime|No note yet|30-second previews/
  );
}

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
    ["/", 200, "Hi, I&#x27;m Olayinka."],
    ["/nato", 200, "NATO Phonetic Alphabet"],
    ["/things/books", 200, "Playing to Win"],
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
  assert.equal(redirect.headers.get("location"), "/things/books");

  const home = await fetch(`http://127.0.0.1:${port}/`);
  assert.match(
    home.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/
  );
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
} finally {
  server.kill("SIGTERM");
}

console.log("Production build validation passed.");
