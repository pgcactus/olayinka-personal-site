import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.disable("x-powered-by");

  // Security defaults apply to static files, redirects, and the 404 document.
  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self'",
      "connect-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
    ].join("; "));
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.get("/manus-storage/:key", async (req, res) => {
    const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeBaseUrl || !forgeKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL("v1/storage/presign/get", `${forgeBaseUrl}/`);
      forgeUrl.searchParams.set("path", req.params.key);
      const forgeResponse = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${forgeKey}` },
      });
      if (!forgeResponse.ok) {
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResponse.json() as { url?: string };
      if (!url) {
        res.status(502).send("Storage backend error");
        return;
      }
      res.redirect(307, url);
    } catch {
      res.status(502).send("Storage proxy error");
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Preserve old search results and bookmarks with a permanent redirect.
  app.get("/things/books", (_req, res) => {
    res.redirect(301, "/things/vinyls");
  });

  const prerenderedRoutes = ["/", "/things/vinyls", "/things/places", "/nato"];
  app.get(prerenderedRoutes, (req, res) => {
    const routeFile = req.path === "/"
      ? path.join(staticPath, "index.html")
      : path.join(staticPath, req.path.slice(1), "index.html");
    res.sendFile(routeFile);
  });

  app.use(express.static(staticPath, { extensions: ["html"], redirect: false }));

  // Known client-side routes are emitted as static HTML during the build. Any
  // route that is neither a static file nor a valid emitted route must be an
  // actual 404 rather than silently receiving the homepage shell.
  app.get("*", (_req, res) => {
    res.status(404).sendFile(path.join(staticPath, "404.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
