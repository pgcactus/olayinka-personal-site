export const SITE_URL = "https://olayinka.xyz";
export const SITE_NAME = "Olayinka Titilola";
export const OG_IMAGE = `${SITE_URL}/og.png`;

export interface RouteMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  jobTitle: "Product Manager",
  url: SITE_URL,
  sameAs: [
    "https://www.linkedin.com/in/olayinkaetitilola/",
    "https://github.com/pgcactus",
  ],
};

export const ROUTE_META = {
  home: {
    title: SITE_NAME,
    description:
      "Product manager in London working across onboarding, identity verification, fraud controls and account security.",
    path: "/",
    jsonLd: personJsonLd,
  },
  books: {
    title: `Books — ${SITE_NAME}`,
    description:
      "Books I have read across product strategy, systems thinking, fiction and more.",
    path: "/things/books",
  },
  vinyls: {
    title: `Vinyls — ${SITE_NAME}`,
    description:
      "Records in my collection, including release details and favourite tracks.",
    path: "/things/vinyls",
  },
  places: {
    title: `Places — ${SITE_NAME}`,
    description:
      "Countries I have visited, mapped with a sourced fact about each place.",
    path: "/things/places",
  },
  nato: {
    title: `NATO alphabet — ${SITE_NAME}`,
    description:
      "Convert words and phrases to and from the NATO phonetic alphabet.",
    path: "/nato",
  },
  notFound: {
    title: `Page not found — ${SITE_NAME}`,
    description: "This page does not exist.",
    path: "/404",
    noindex: true,
  },
} satisfies Record<string, RouteMeta>;

export const PRERENDER_PATHS = [
  "/",
  "/things/books",
  "/things/vinyls",
  "/things/places",
  "/nato",
  "/404",
] as const;

export function getRouteMeta(pathname: string): RouteMeta {
  const canonicalPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  return (
    Object.values(ROUTE_META).find(meta => meta.path === canonicalPath) ??
    ROUTE_META.notFound
  );
}
