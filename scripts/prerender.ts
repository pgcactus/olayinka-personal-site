/**
 * prerender.ts — build-time prerender script.
 *
 * Run via: npx tsx scripts/prerender.ts
 * Called automatically by the custom Rollup closeBundle hook in vite.config.ts.
 *
 * Uses tsx to execute TypeScript/JSX directly in Node without a separate
 * build step, avoiding the source-map WASM worker hang from vite-prerender-plugin.
 * 
 * React 19 renders head tags (title, meta, script) as JSX elements in the component tree.
 * We extract these tags from the rendered HTML and inject them into the actual <head>.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { Router } from "wouter";
import App from "../client/src/App";

// PRERENDER_ROOT is set by vite.config.ts when running as a CJS bundle via esbuild.
// Fall back to import.meta.url for direct tsx execution.
const ROOT = process.env.PRERENDER_ROOT
  ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist", "public");

const PRERENDER_ROUTES = [
  "/",
  "/things/books",
  "/things/vinyls",
  "/things/places",
  "/nato",
];

// Block external fetch during prerender (no network in deployment)
const origFetch = globalThis.fetch;
globalThis.fetch = async (url: RequestInfo | URL, opts?: RequestInit) => {
  const urlStr = String(url);
  if (urlStr.startsWith("/")) {
    try {
      const filePath = join(DIST, urlStr.replace(/^\//, ""));
      const content = readFileSync(filePath, "utf-8");
      return new Response(content, { status: 200 });
    } catch {
      return new Response(null, { status: 404 });
    }
  }
  // Block all external requests — return empty 503
  return new Response(null, { status: 503 });
};

let tpl = readFileSync(join(DIST, "index.html"), "utf-8");

// Remove the default <title> from the template so route-specific titles can be injected
tpl = tpl.replace(/<title>.*?<\/title>/i, "");

for (const route of PRERENDER_ROUTES) {
  // Set location globals for wouter's SSR path
  const u = new URL(route, "http://localhost");
  (globalThis as any).location = {
    href: u.href,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    origin: u.origin,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    protocol: u.protocol,
    toString: () => u.href,
  };
  (globalThis as any).self = globalThis;

  // Render the app to HTML
  const html = renderToString(
    createElement(Router, { ssrPath: route }, createElement(App, null))
  );

  // Extract head tags from the rendered HTML using regex
  // Matches: <title>...</title>, <meta .../>, <link .../>, <script>...</script>
  const headTagRegex = /<(title|meta|link|script)(?:\s[^>]*)?>(?:.*?)<\/\1>|<(meta|link)(?:\s[^>]*)?\s*\/>/gi;
  const headTags: string[] = [];
  let match;
  
  // Extract all head tags
  while ((match = headTagRegex.exec(html)) !== null) {
    headTags.push(match[0]);
  }

  // Remove head tags from the body HTML
  let bodyHtml = html;
  for (const tag of headTags) {
    // Use a simple string replacement (not regex to avoid issues with special chars)
    bodyHtml = bodyHtml.split(tag).join("");
  }

  // Inject prerendered HTML into the root div, not directly in body
  let output = tpl;
  
  // Inject head tags before </head>
  if (headTags.length > 0) {
    const headContent = headTags.join("\n    ");
    output = output.replace("</head>", `    ${headContent}\n  </head>`);
  }
  
  // Inject prerendered HTML into the root div
  output = output.replace(/<div id="root"><\/div>/, `<div id="root">${bodyHtml}</div>`);
  // If root div not found, fall back to injecting after body tag
  if (!output.includes(`<div id="root">${bodyHtml}</div>`)) {
    output = output.replace(/<body([^>]*)>/, `<body$1>${bodyHtml}`);
  }

  // Write output file
  const outDir =
    route === "/" ? DIST : join(DIST, ...route.replace(/^\//, "").split("/"));
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "index.html");
  writeFileSync(outFile, output, "utf-8");
  console.log(`  Prerendered: ${route} → ${outFile.replace(ROOT + "/", "")}`);
}

console.log(`\nPrerendered ${PRERENDER_ROUTES.length} pages.`);
process.exit(0);
