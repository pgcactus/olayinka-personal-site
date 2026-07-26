import { useEffect } from "react";
import { OG_IMAGE, SITE_NAME, SITE_URL, type RouteMeta } from "@/site-meta";

interface PageMetaProps {
  meta: RouteMeta;
}

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function PageMeta({ meta }: PageMetaProps) {
  useEffect(() => {
    const { title, description, path, noindex, jsonLd } = meta;
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const metadata = [
      ["property", "og:type", "website"],
      ["property", "og:locale", "en_GB"],
      ["property", "og:site_name", SITE_NAME],
      ["property", "og:url", url],
      ["property", "og:title", title],
      ["property", "og:description", description],
      ["property", "og:image", OG_IMAGE],
      ["property", "og:image:alt", `${SITE_NAME} — Product Manager`],
      ["property", "og:image:width", "1200"],
      ["property", "og:image:height", "630"],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", title],
      ["name", "twitter:description", description],
      ["name", "twitter:image", OG_IMAGE],
      ["name", "twitter:image:alt", `${SITE_NAME} — Product Manager`],
    ] as const;

    for (const [attribute, key, content] of metadata) {
      upsertMeta(attribute, key, content);
    }

    const existingJsonLd = document.getElementById("page-json-ld");
    existingJsonLd?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "page-json-ld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    }
  }, [meta]);

  return null;
}
