import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  defineConfig,
  loadEnv,
  type IndexHtmlTransformResult,
  type Plugin,
} from "vite";

const PROJECT_ROOT = import.meta.dirname;

// =============================================================================
// Sitemap + robots.txt emitter — runs at the end of every production build
// =============================================================================

const SITE_URL = "https://olayinka.xyz";
// /things/places is still prerendered (see scripts/prerender.ts) but kept out of
// the sitemap and marked noindex while its UX is redesigned.
const SITEMAP_ROUTES = ["/", "/things/vinyls", "/nato"];

function vitePluginSitemapRobots(): Plugin {
  return {
    name: "sitemap-robots",
    apply: "build",
    generateBundle() {
      const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // sitemap.xml
      const urlEntries = SITEMAP_ROUTES.map(
        route =>
          `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
      ).join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: sitemap,
      });

      // robots.txt
      const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robots,
      });
    },
  };
}

// =============================================================================
// Custom prerender plugin — spawns a child process so Node exits cleanly
// (avoids the source-map WASM worker hang in vite-prerender-plugin)
// =============================================================================

function vitePluginPrerender(): Plugin {
  return {
    name: "prerender",
    apply: "build",
    enforce: "post",
    closeBundle() {
      // Bundle prerender.ts with esbuild then run it with plain Node.
      // This avoids the tsx worker-thread loader limitation and the
      // source-map WASM worker hang from vite-prerender-plugin.
      const wrapper = path.resolve(PROJECT_ROOT, "scripts/run-prerender.mjs");
      const result = spawnSync(process.execPath, [wrapper], {
        stdio: "inherit",
        env: { ...process.env },
      });
      if (result.status !== 0) {
        this.error(`Prerender script exited with code ${result.status}`);
      }
    },
  };
}

function optionalAnalyticsPlugin(
  endpoint?: string,
  websiteId?: string
): Plugin {
  return {
    name: "optional-analytics",
    transformIndexHtml(): IndexHtmlTransformResult {
      if (!endpoint || !websiteId) return [];

      return [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: `${endpoint.replace(/\/+$/, "")}/umami`,
            "data-website-id": websiteId,
          },
          injectTo: "body",
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, PROJECT_ROOT, "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      optionalAnalyticsPlugin(
        env.VITE_ANALYTICS_ENDPOINT,
        env.VITE_ANALYTICS_WEBSITE_ID
      ),
      vitePluginPrerender(),
      vitePluginSitemapRobots(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(PROJECT_ROOT, "client", "src"),
      },
    },
    envDir: PROJECT_ROOT,
    root: path.resolve(PROJECT_ROOT, "client"),
    build: {
      outDir: path.resolve(PROJECT_ROOT, "dist/public"),
      emptyOutDir: true,
      // Read by scripts/run-prerender.mjs to resolve image URLs, then deleted.
      manifest: true,
    },
    server: {
      port: 3000,
      strictPort: false, // Will find next available port if 3000 is busy
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
