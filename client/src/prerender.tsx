/**
 * prerender.tsx — build-time prerender entry for vite-prerender-plugin.
 *
 * Exports a `prerender` function that renders each route to HTML.
 * The plugin calls this for every URL in the `links` set.
 */

import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import type { HelmetServerState } from "react-helmet-async";
import App from "./App";

const ROUTES = ["/", "/things/books", "/things/vinyls", "/things/places", "/nato"];

export async function prerender({ url }: { url: string }) {
  const helmetContext: { helmet?: HelmetServerState | null } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <Router ssrPath={url}>
        <App />
      </Router>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;

  // Build head elements from helmet state as raw HTML strings
  const headParts: string[] = [];
  if (helmet) {
    const title = helmet.title.toString();
    const meta = helmet.meta.toString();
    const link = helmet.link.toString();
    const script = helmet.script.toString();
    if (title) headParts.push(title);
    if (meta) headParts.push(meta);
    if (link) headParts.push(link);
    if (script) headParts.push(script);
  }

  return {
    html,
    head: headParts.join("\n"),
    links: new Set(ROUTES),
  };
}
