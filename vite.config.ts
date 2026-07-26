import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  defineConfig,
  loadEnv,
  type IndexHtmlTransformResult,
  type Plugin,
} from "vite";
import { vitePrerenderPlugin } from "vite-prerender-plugin";

const PROJECT_ROOT = import.meta.dirname;
const SITE_URL = "https://olayinka.xyz";
const PRERENDER_ROUTES = [
  "/",
  "/things/books",
  "/things/vinyls",
  "/things/places",
  "/nato",
  "/404",
];

function sitemapRobotsPlugin(): Plugin {
  return {
    name: "sitemap-and-robots",
    apply: "build",
    generateBundle() {
      const publicRoutes = PRERENDER_ROUTES.filter(route => route !== "/404");
      const urlEntries = publicRoutes
        .map(route => `  <url>\n    <loc>${SITE_URL}${route}</loc>\n  </url>`)
        .join("\n");

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `${urlEntries}\n</urlset>\n`,
      });

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
    async writeBundle(options) {
      if (!options.dir) return;
      await fs.copyFile(
        path.join(options.dir, "404", "index.html"),
        path.join(options.dir, "404.html")
      );
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
      ...vitePrerenderPlugin({
        prerenderScript: path.resolve(PROJECT_ROOT, "client/src/prerender.tsx"),
        renderTarget: "#root",
        additionalPrerenderRoutes: PRERENDER_ROUTES,
        previewMiddlewareFallback: "/404/index.html",
      }),
      sitemapRobotsPlugin(),
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
      target: "es2022",
    },
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "terminal.local",
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
