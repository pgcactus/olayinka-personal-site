import express, { type Response } from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_ROUTES = new Map([
  ["/", "index.html"],
  ["/nato", "nato/index.html"],
  ["/things/books", "things/books/index.html"],
  ["/things/vinyls", "things/vinyls/index.html"],
  ["/things/places", "things/places/index.html"],
]);

const SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://manus-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://is1-ssl.mzstatic.com",
  "connect-src 'self' https://manus-analytics.com",
  "upgrade-insecure-requests",
].join("; ");

function sendHtml(response: Response, staticPath: string, fileName: string) {
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.sendFile(path.join(staticPath, fileName));
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.disable("x-powered-by");

  app.use((_request, response, next) => {
    response.setHeader("Content-Security-Policy", SECURITY_POLICY);
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (process.env.NODE_ENV === "production") {
      response.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }
    next();
  });

  app.get("/things", (_request, response) => {
    response.redirect(308, "/things/books");
  });

  for (const [route, fileName] of HTML_ROUTES) {
    app.get(
      [route, route === "/" ? route : `${route}/`],
      (_request, response) => {
        sendHtml(response, staticPath, fileName);
      }
    );
  }

  app.use(
    express.static(staticPath, {
      index: false,
      redirect: false,
      setHeaders(response, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          response.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        } else if (!filePath.endsWith(".html")) {
          response.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    })
  );

  app.use((_request, response) => {
    response.status(404);
    sendHtml(response, staticPath, "404/index.html");
  });

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
