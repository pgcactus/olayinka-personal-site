/**
 * PageMeta — per-route <head> metadata via React 19 native head hoisting.
 * Handles title, description, og:*, twitter:*, and optional JSON-LD.
 * React 19 automatically hoists <title>, <meta>, <link>, <script> tags from components into <head>.
 */

const SITE_URL = "https://olayinka.xyz";
const OG_IMAGE = `${SITE_URL}/og.png`;
const SITE_NAME = "Olayinka Titilola";

interface PageMetaProps {
  title: string;           // Full <title> string, e.g. "Olayinka Titilola" or "NATO alphabet — Olayinka Titilola"
  description: string;
  path: string;            // e.g. "/" or "/nato"
  noindex?: boolean;
  jsonLd?: object;
}

export default function PageMeta({ title, description, path, noindex, jsonLd }: PageMetaProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  );
}
