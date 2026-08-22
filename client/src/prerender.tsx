/**
 * prerender.tsx — build-time prerender entry for custom esbuild-based prerendering.
 *
 * Exports a `prerender` function that renders each route to HTML.
 * React 19 automatically hoists <title>, <meta>, <link>, <script> tags from components into <head>.
 */

import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import AppServer from "./AppServer";

const ROUTES = ["/", "/things/vinyls", "/things/places", "/nato"];

export async function prerender({ url }: { url: string }) {
  const html = renderToString(
    <Router ssrPath={url}>
      <AppServer />
    </Router>
  );

  return {
    html,
    links: new Set(ROUTES),
  };
}
