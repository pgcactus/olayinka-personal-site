/**
 * prerender.tsx — build-time prerender entry for vite-prerender-plugin.
 *
 * Exports a `prerender` function that renders each route to HTML.
 * The plugin calls this for every URL in the `links` set.
 */

import { renderToString } from "react-dom/server";
import App from "./App";
import {
  getRouteMeta,
  OG_IMAGE,
  PRERENDER_PATHS,
  SITE_NAME,
  SITE_URL,
} from "./site-meta";

interface PrerenderHeadElement {
  type: string;
  props: Record<string, string>;
}

export async function prerender({ url }: { url: string }) {
  const pathname = new URL(url, SITE_URL).pathname;
  const meta = getRouteMeta(pathname);
  const canonicalUrl = `${SITE_URL}${meta.path}`;
  const html = renderToString(<App ssrPath={pathname} />);

  const elements = new Set<PrerenderHeadElement>([
    {
      type: "meta",
      props: { name: "description", content: meta.description },
    },
    {
      type: "meta",
      props: {
        name: "robots",
        content: meta.noindex ? "noindex, nofollow" : "index, follow",
      },
    },
    {
      type: "link",
      props: { rel: "canonical", href: canonicalUrl },
    },
    {
      type: "meta",
      props: { property: "og:type", content: "website" },
    },
    {
      type: "meta",
      props: { property: "og:locale", content: "en_GB" },
    },
    {
      type: "meta",
      props: { property: "og:site_name", content: SITE_NAME },
    },
    {
      type: "meta",
      props: { property: "og:url", content: canonicalUrl },
    },
    {
      type: "meta",
      props: { property: "og:title", content: meta.title },
    },
    {
      type: "meta",
      props: { property: "og:description", content: meta.description },
    },
    {
      type: "meta",
      props: { property: "og:image", content: OG_IMAGE },
    },
    {
      type: "meta",
      props: {
        property: "og:image:alt",
        content: `${SITE_NAME} — Product Manager`,
      },
    },
    {
      type: "meta",
      props: { property: "og:image:width", content: "1200" },
    },
    {
      type: "meta",
      props: { property: "og:image:height", content: "630" },
    },
    {
      type: "meta",
      props: { name: "twitter:card", content: "summary_large_image" },
    },
    {
      type: "meta",
      props: { name: "twitter:title", content: meta.title },
    },
    {
      type: "meta",
      props: { name: "twitter:description", content: meta.description },
    },
    {
      type: "meta",
      props: { name: "twitter:image", content: OG_IMAGE },
    },
  ]);

  if (meta.jsonLd) {
    elements.add({
      type: "script",
      props: {
        id: "page-json-ld",
        type: "application/ld+json",
        children: JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c"),
      },
    });
  }

  return {
    html,
    head: {
      lang: "en",
      title: meta.title,
      elements,
    },
    links: new Set(PRERENDER_PATHS),
  };
}
