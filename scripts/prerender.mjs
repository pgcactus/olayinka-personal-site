/**
 * prerender.mjs — standalone prerender script.
 *
 * Called by the custom Rollup plugin after `vite build` writes dist/.
 * Renders each route to HTML using React's renderToString and writes
 * the result to dist/public/<route>/index.html.
 *
 * Usage: node --experimental-vm-modules scripts/prerender.mjs
 * (called automatically by vite.config.ts closeBundle hook)
 */

import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist", "public");
const PRERENDER_ROUTES = ["/", "/things/vinyls", "/things/places", "/nato"];

// The prerender entry is built as assets/prerender.js (fixed name via rollupOptions)
const prerenderChunk = "prerender.js";
const assetsDir = join(DIST, "assets");

const chunkPath = pathToFileURL(join(assetsDir, prerenderChunk)).href;
console.log("Loading prerender chunk:", prerenderChunk);

// Set up globals needed by the prerender module
globalThis.location = {};
globalThis.self = globalThis;
globalThis.__VITE_PRELOAD__ = [];

// Intercept fetch: serve local files from dist, block external requests
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (typeof url === "string" && url.startsWith("/")) {
    try {
      const filePath = join(DIST, url.replace(/^\//, ""));
      const content = readFileSync(filePath, "utf-8");
      return new Response(content, { status: 200 });
    } catch {
      return new Response(null, { status: 404 });
    }
  }
  // Block all external requests during prerender to avoid hanging
  return new Response(null, { status: 503 });
};

const { prerender } = await import(chunkPath);

if (typeof prerender !== "function") {
  console.error("prerender export is not a function");
  process.exit(1);
}

const tpl = readFileSync(join(DIST, "index.html"), "utf-8");

for (const route of PRERENDER_ROUTES) {
  // Update location globals
  const u = new URL(route, "http://localhost");
  for (const key of Object.keys(Object.getOwnPropertyDescriptors(URL.prototype))) {
    try { globalThis.location[key] = String(u[key]); } catch {}
  }
  globalThis.location.pathname = u.pathname;
  globalThis.location.href = u.href;
  globalThis.location.toString = () => u.href;

  const result = await prerender({ ssr: true, url: route, route: { url: route } });

  if (!result) {
    console.warn(`No result for route: ${route}`);
    continue;
  }

  const body = typeof result === "string" ? result : result.html ?? "";
  const head = typeof result === "object" && result.head ? result.head : "";

  // Inject body and head into template
  let html = tpl;

  // Inject head tags before </head>
  if (head) {
    html = html.replace("</head>", `${head}\n</head>`);
  }

  // Inject body content after <body>
  html = html.replace(/<body([^>]*)>/, `<body$1>${body}`);

  // Write output
  const outDir = route === "/" ? DIST : join(DIST, ...route.replace(/^\//, "").split("/"));
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "index.html");
  writeFileSync(outFile, html, "utf-8");
  console.log(`  Prerendered: ${route} → ${outFile.replace(ROOT + "/", "")}`);
}

console.log(`\nPrerendered ${PRERENDER_ROUTES.length} pages.`);
// Force exit to avoid any lingering async handles
process.exit(0);
