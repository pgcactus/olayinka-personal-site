/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by ?tab= query param
 * - Active tab: ice blue highlight #E0F2FE, darkens to #BAE6FD on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Books: bento mosaic with gradient tiles, variable sizes, hover strip
 * - Vinyls / Places: placeholder SVG grid (unchanged)
 * - Page-level fade-in on mount (300ms, no stagger)
 * - Back link top-left, 13px, #5A5A5A, fades to 60% on hover
 */

import { useState } from "react";
import VINYLS_RESOLVED from "../data/vinyls-resolved.json";
import BOOKS_RESOLVED from "../data/books-resolved.json";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";

type Tab = "books" | "vinyls" | "places";

// ---------------------------------------------------------------------------
// Books data
// ---------------------------------------------------------------------------

type BookCategory =
  | "business"
  | "product"
  | "classics"
  | "thrillers"
  | "nonfiction";

type TileSize = "large" | "wide" | "tall" | "small";

interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number | string;
  read: number;
  size: TileSize;
  isbn: string;
  coverUrl: string | null;
  localFallback: string;
}

const BOOKS: Book[] = BOOKS_RESOLVED as Book[];

// ---------------------------------------------------------------------------
// Typography scale per tile size
// ---------------------------------------------------------------------------

const FONT_SIZES: Record<TileSize, { title: string; author: string }> = {
  large: { title: "18px", author: "13px" },
  wide:  { title: "15px", author: "12px" },
  tall:  { title: "14px", author: "11px" },
  small: { title: "13px", author: "11px" },
};

// ---------------------------------------------------------------------------
// BentoTile — cover image tile with gradient overlay and hover strip
// ---------------------------------------------------------------------------

function BentoTile({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(book.coverUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const fonts = FONT_SIZES[book.size];

  function handleImgError() {
    if (imgSrc === book.coverUrl && book.localFallback) {
      // Try local fallback
      setImgSrc(book.localFallback);
    } else {
      // All sources exhausted — show text fallback
      setImgFailed(true);
    }
  }

  return (
    <div
      className={`bento-tile tile-${book.size}${hovered ? " bento-tile--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image or dark fallback tile */}
      {!imgFailed && imgSrc ? (
        <img
          src={imgSrc}
          alt={`${book.title} cover`}
          className="bento-cover"
          onError={handleImgError}
          draggable={false}
        />
      ) : (
        <div className="bento-fallback" />
      )}

      {/* Gradient overlay for text readability */}
      <div className="bento-gradient-overlay" />

      {/* Title — top-left */}
      <span
        className="bento-tile-title"
        style={{ fontSize: fonts.title }}
      >
        {book.title}
      </span>

      {/* Author — bottom-left */}
      <span
        className="bento-tile-author"
        style={{ fontSize: fonts.author }}
      >
        {book.author}
      </span>

      {/* Hover strip — slides up from bottom */}
      <div className={`tile-overlay${hovered ? " tile-overlay--visible" : ""}`}>
        Published {book.year}&nbsp;&middot;&nbsp;Read {book.read}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vinyls data — pre-resolved at build time via scripts/resolve-vinyl-covers.mjs
// No client-side API calls; coverUrl is baked in at build time.
// ---------------------------------------------------------------------------

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string | null;
}

const VINYLS: Vinyl[] = VINYLS_RESOLVED as Vinyl[];

// VinylCard component — renders pre-resolved cover, no async fetch
function VinylCard({ vinyl }: { vinyl: Vinyl }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`vinyl-card${hovered ? " vinyl-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image or fallback tile */}
      {vinyl.coverUrl ? (
        <img
          src={vinyl.coverUrl}
          alt={`${vinyl.title} by ${vinyl.artist}`}
          className="vinyl-cover"
          draggable={false}
        />
      ) : (
        <div className="vinyl-fallback">
          <span className="vinyl-fallback-title">{vinyl.title}</span>
          <span className="vinyl-fallback-artist">{vinyl.artist}</span>
        </div>
      )}

      {/* Hover strip */}
      <div className={`vinyl-overlay${hovered ? " vinyl-overlay--visible" : ""}`}>
        Released {vinyl.year}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder image generator for places (unchanged)
// ---------------------------------------------------------------------------

function placeSvg(fill: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='66' viewBox='0 0 100 66'%3E%3Crect width='100' height='66' rx='2' fill='${encodeURIComponent(fill)}'/%3E%3C/svg%3E`;
}

const placeColours = [
  "#A8B8C9", "#B8A8C4", "#A8C4B8", "#C4A8B8",
  "#B8C4A8", "#A8B8B8", "#C4B8A8", "#B8A8B8",
  "#A8C4C4", "#C4A8A8",
];

interface PlaceholderItem {
  id: string;
  image: string;
  category: "places";
}

const placeholderItems: PlaceholderItem[] = [
  ...placeColours.map((c, i) => ({ id: `place-${i}`, image: placeSvg(c), category: "places" as const })),
];

// ---------------------------------------------------------------------------
// Tab parsing
// ---------------------------------------------------------------------------

const TABS: Tab[] = ["books", "vinyls", "places"];

function parseTab(search: string): Tab {
  const params = new URLSearchParams(search);
  const raw = params.get("tab");
  if (raw === "vinyls" || raw === "places") return raw;
  return "books";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Things() {
  const search = useSearch();
  const activeTab = parseTab(search ? `?${search}` : "");

  function setTab(tab: Tab) {
    window.history.replaceState(null, "", `/things?tab=${tab}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <motion.div
      className="things-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="things-content">
        {/* Back link */}
        <Link href="/" className="things-back">
          &#8627; back
        </Link>

        {/* Heading / tab row */}
        <div className="things-heading">
          {TABS.map((tab, i) => (
            <span key={tab}>
              <button
                className={`things-tab ${activeTab === tab ? "things-tab--active" : "things-tab--inactive"}`}
                onClick={() => setTab(tab)}
              >
                {tab}
              </button>
              {i < TABS.length - 1 && (
                <span className="things-dot">&nbsp;&middot;&nbsp;</span>
              )}
            </span>
          ))}
        </div>

        {/* Books tab: bento mosaic */}
        {activeTab === "books" && (
          <div className="bento-grid">
            {BOOKS.map((book) => (
              <BentoTile key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Vinyls tab: real album grid */}
        {activeTab === "vinyls" && (
          <div className="vinyls-grid">
            {VINYLS.map((vinyl) => (
              <VinylCard key={vinyl.id} vinyl={vinyl} />
            ))}
          </div>
        )}

        {/* Places tab: placeholder grid */}
        {activeTab === "places" && (
          <div className="things-grid">
            {placeholderItems
              .filter((item) => item.category === activeTab)
              .map((item) => (
                <div key={item.id} className="things-cell">
                  <img
                    src={item.image}
                    alt=""
                    className="things-img"
                    draggable={false}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
