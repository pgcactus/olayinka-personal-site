/**
 * run-prerender.mjs — wrapper called by vite.config.ts closeBundle hook.
 *
 * 1. Uses esbuild to bundle prerender.ts into a self-contained CJS file.
 *    Image imports resolve to the hashed URLs Vite emitted (read from Vite's
 *    build manifest), so prerendered <img> tags match the client bundle
 *    instead of inlining every image as base64.
 * 2. Runs the bundle with Node, passing PRERENDER_ROOT so it can find dist/.
 *
 * This avoids tsx's worker-thread loader limitation and the source-map WASM
 * worker hang from vite-prerender-plugin.
 */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(ROOT, "client");
const MANIFEST_DIR = join(ROOT, "dist/public/.vite");
const PRERENDER_TS = join(ROOT, "scripts/prerender.ts");
const TSCONFIG = join(ROOT, "tsconfig.json");

const manifest = JSON.parse(
  readFileSync(join(MANIFEST_DIR, "manifest.json"), "utf8")
);

// Resolve image imports to the URL Vite emitted for the same source file.
const viteAssetUrls = {
  name: "vite-asset-urls",
  setup(pluginBuild) {
    pluginBuild.onLoad(
      { filter: /\.(jpe?g|png|svg|gif|webp|avif|ico)$/ },
      ({ path }) => {
        const entry = manifest[relative(CLIENT_ROOT, path)];
        if (!entry) {
          throw new Error(`No Vite asset for ${path}; was it imported?`);
        }
        return {
          contents: `export default ${JSON.stringify(`/${entry.file}`)};`,
          loader: "js",
        };
      }
    );
  },
};

// Write bundle to a temp file
const TMP = join(tmpdir(), `prerender-bundle-${Date.now()}.cjs`);

console.log("  Building prerender bundle...");
await build({
  entryPoints: [PRERENDER_TS],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: TMP,
  loader: { ".css": "empty", ".scss": "empty" },
  plugins: [viteAssetUrls],
  tsconfig: TSCONFIG,
  jsx: "automatic",
  logLevel: "error",
});

console.log("  Running prerender...");
execFileSync(process.execPath, [TMP], {
  stdio: "inherit",
  env: { ...process.env, PRERENDER_ROOT: ROOT },
});

// The manifest is only needed here; keep it out of the deployed files.
rmSync(MANIFEST_DIR, { recursive: true, force: true });

process.exit(0);
