/**
 * prerender-loader.mjs — Node.js ESM loader for the tsx prerender run.
 *
 * Fixes two issues:
 * 1. tsx incorrectly marks ESM .js files (without "type":"module") as
 *    format:commonjs, breaking named imports. We override to "module" for
 *    known ESM packages (react-helmet-async, etc.).
 * 2. Stubs out non-JS/TS imports (images, CSS) so tsx can run without Vite.
 *
 * Usage: registered via --import in vite.config.ts closeBundle hook.
 */

// Image extensions — return the import path as a string (URL)
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".avif", ".ico"]);
// Style extensions — return empty object
const STYLE_EXTS = new Set([".css", ".scss", ".sass", ".less"]);

// Packages whose .js files are actually ESM (no "type":"module" in package.json)
// tsx incorrectly marks these as commonjs, breaking named imports.
const FORCE_ESM_PATTERNS = [
  "react-helmet-async/lib/index.esm.js",
];

export async function resolve(specifier, context, nextResolve) {
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const cleanUrl = url.split("?")[0];
  const ext = cleanUrl.split(".").pop()?.toLowerCase() ?? "";

  if (IMAGE_EXTS.has(`.${ext}`)) {
    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${JSON.stringify(url)};`,
    };
  }

  if (STYLE_EXTS.has(`.${ext}`)) {
    return {
      format: "module",
      shortCircuit: true,
      source: `export default {};`,
    };
  }

  // Fix tsx's incorrect commonjs format for known ESM .js files
  if (context.format === "commonjs" && FORCE_ESM_PATTERNS.some(p => cleanUrl.includes(p))) {
    return nextLoad(url, { ...context, format: "module" });
  }

  return nextLoad(url, context);
}
