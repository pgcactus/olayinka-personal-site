/**
 * run-prerender.mjs — wrapper called by vite.config.ts closeBundle hook.
 *
 * 1. Uses esbuild to bundle prerender.ts into a self-contained CJS file.
 * 2. Runs the bundle with Node, passing PRERENDER_ROOT so it can find dist/.
 *
 * This avoids tsx's worker-thread loader limitation and the source-map WASM
 * worker hang from vite-prerender-plugin.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ESBUILD = join(ROOT, "node_modules/.bin/esbuild");
const PRERENDER_TS = join(ROOT, "scripts/prerender.ts");
const TSCONFIG = join(ROOT, "tsconfig.json");

// Write bundle to a temp file
const TMP = join(tmpdir(), `prerender-bundle-${Date.now()}.cjs`);

console.log("  Building prerender bundle...");
execFileSync(ESBUILD, [
  PRERENDER_TS,
  "--bundle",
  "--platform=node",
  "--format=cjs",
  `--outfile=${TMP}`,
  "--loader:.jpg=dataurl",
  "--loader:.png=dataurl",
  "--loader:.svg=dataurl",
  "--loader:.gif=dataurl",
  "--loader:.webp=dataurl",
  "--loader:.jpeg=dataurl",
  "--loader:.ico=dataurl",
  "--loader:.avif=dataurl",
  "--loader:.css=empty",
  "--loader:.scss=empty",
  `--tsconfig=${TSCONFIG}`,
  "--jsx=automatic",
  "--log-level=error",
], { stdio: "inherit" });

console.log("  Running prerender...");
execFileSync(process.execPath, [TMP], {
  stdio: "inherit",
  env: { ...process.env, PRERENDER_ROOT: ROOT },
});

process.exit(0);
