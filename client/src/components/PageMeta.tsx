/**
 * Design Philosophy: Minimal Monospace — route metadata is quiet, precise, and
 * explicit. React 19 hoists these tags into <head> during SSR and client render.
 */

const SITE_URL = "https://olayinka.xyz";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;
const SITE_NAME = "Olayinka Titilola";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: object;
  ogImage?: string;
  preloadImages?: string[];
}

export default function PageMeta({
  title,
  description,
  path,
  noindex,
  jsonLd,
  ogImage = DEFAULT_OG_IMAGE,
  preloadImages = [],
}: PageMetaProps) {
  const url = `${SITE_URL}${path}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      {preloadImages.map((image) => (
        <link
          key={image}
          rel="preload"
          as="image"
          href={image}
          type={image.endsWith(".webp") ? "image/webp" : undefined}
        />
      ))}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  );
}
