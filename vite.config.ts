import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const PROJECT_ROOT = import.meta.dirname;
const SITE_URL = "https://olayinka.xyz";
const PRERENDER_ROUTES = [
  "/",
  "/things/vinyls",
  "/things/places",
  "/nato",
];

// Emit the public route index from the same source used by prerendering.
function vitePluginSitemapRobots(): Plugin {
  return {
    name: "sitemap-robots",
    apply: "build",
    generateBundle() {
      const now = new Date().toISOString().split("T")[0];
      const urlEntries = PRERENDER_ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
      ).join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
        if (!key || !forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Storage proxy not configured");
          return;
        }
        try {
          const forgeUrl = new URL("v1/storage/presign/get", `${forgeBaseUrl}/`);
          forgeUrl.searchParams.set("path", key);
          const forgeResponse = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });
          const { url } = await forgeResponse.json() as { url?: string };
          if (!forgeResponse.ok || !url) throw new Error("Storage backend error");
          res.writeHead(307, { Location: url, "Cache-Control": "public, max-age=31536000, immutable" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

// Bundle and run the prerenderer after Vite has emitted the client assets.
function vitePluginPrerender(): Plugin {
  return {
    name: "prerender",
    apply: "build",
    enforce: "post",
    closeBundle() {
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

export default defineConfig({
  plugins: [
    react(),
    vitePluginStorageProxy(),
    tailwindcss(),
    vitePluginPrerender(),
    vitePluginSitemapRobots(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },
  envDir: PROJECT_ROOT,
  root: path.resolve(PROJECT_ROOT, "client"),
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist/public"),
    emptyOutDir: true,
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
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
