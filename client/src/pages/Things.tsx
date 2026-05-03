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

import { useState, useEffect } from "react";
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
}

const BOOKS: Book[] = [
  { id: "playing-to-win", title: "Playing to Win", author: "A.G. Lafley & Roger Martin", category: "business", year: 2013, read: 2024, size: "wide" },
  { id: "the-score-takes-care-of-itself", title: "The Score Takes Care of Itself", author: "Bill Walsh", category: "business", year: 2009, read: 2025, size: "tall" },
  { id: "how-to-measure-anything", title: "How to Measure Anything", author: "Douglas Hubbard", category: "product", year: 2007, read: 2024, size: "small" },
  { id: "thinking-in-systems", title: "Thinking in Systems", author: "Donella H. Meadows", category: "product", year: 2008, read: 2025, size: "large" },
  { id: "human-powered", title: "Human Powered", author: "Trenton Moss", category: "product", year: 2021, read: 2024, size: "small" },
  { id: "inspired", title: "Inspired", author: "Marty Cagan", category: "product", year: 2008, read: 2026, size: "wide" },
  { id: "burmese-days", title: "Burmese Days", author: "George Orwell", category: "classics", year: 1934, read: 2025, size: "tall" },
  { id: "nineteen-eighty-four", title: "Nineteen Eighty-Four", author: "George Orwell", category: "classics", year: 1949, read: 2024, size: "large" },
  { id: "to-kill-a-mockingbird", title: "To Kill a Mockingbird", author: "Harper Lee", category: "classics", year: 1960, read: 2024, size: "large" },
  { id: "the-odyssey", title: "The Odyssey", author: "Homer", category: "classics", year: "~700 BC", read: 2026, size: "large" },
  { id: "dr-jekyll", title: "Dr Jekyll and Mr Hyde", author: "Robert Louis Stevenson", category: "classics", year: 1886, read: 2025, size: "tall" },
  { id: "the-raven", title: "The Raven and Other Tales", author: "Edgar Allan Poe", category: "classics", year: 1845, read: 2025, size: "small" },
  { id: "simply-lies", title: "Simply Lies", author: "David Baldacci", category: "thrillers", year: 2023, read: 2024, size: "small" },
  { id: "the-24th-hour", title: "The 24th Hour", author: "James Patterson", category: "thrillers", year: 2024, read: 2024, size: "small" },
  { id: "the-exchange", title: "The Exchange", author: "John Grisham", category: "thrillers", year: 2023, read: 2025, size: "small" },
  { id: "how-to-kill-your-family", title: "How to Kill Your Family", author: "Bella Mackie", category: "thrillers", year: 2021, read: 2025, size: "wide" },
  { id: "vera-wong", title: "Vera Wong's Unsolicited Advice for Murderers", author: "Jesse Q. Sutanto", category: "thrillers", year: 2023, read: 2026, size: "wide" },
  { id: "the-satsuma-complex", title: "The Satsuma Complex", author: "Bob Mortimer", category: "thrillers", year: 2022, read: 2026, size: "small" },
  { id: "outliers", title: "Outliers", author: "Malcolm Gladwell", category: "nonfiction", year: 2008, read: 2024, size: "wide" },
];

// ---------------------------------------------------------------------------
// Gradient generator — hue derived from book id hash, constrained per category
// ---------------------------------------------------------------------------

const PALETTES: Record<BookCategory, { hueRange: [number, number]; sat: number; light: number }> = {
  business:  { hueRange: [200, 240], sat: 55, light: 50 },
  product:   { hueRange: [160, 200], sat: 50, light: 45 },
  classics:  { hueRange: [25,  55],  sat: 35, light: 40 },
  thrillers: { hueRange: [350, 380], sat: 55, light: 42 },
  nonfiction:{ hueRange: [275, 305], sat: 45, light: 45 },
};

function gradientForBook(book: Book): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < book.id.length; i++) {
    hash = (hash << 5) - hash + book.id.charCodeAt(i);
    hash |= 0;
  }
  const palette = PALETTES[book.category];
  const range = palette.hueRange[1] - palette.hueRange[0];
  const baseHue = palette.hueRange[0] + (Math.abs(hash) % range);
  const hue1 = baseHue % 360;
  const hue2 = (baseHue + 25) % 360;
  return {
    from: `hsl(${hue1}, ${palette.sat}%, ${palette.light + 8}%)`,
    to:   `hsl(${hue2}, ${palette.sat + 5}%, ${palette.light - 5}%)`,
  };
}

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
// BentoTile — gradient tile with size-aware typography and hover strip
// ---------------------------------------------------------------------------

function BentoTile({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);
  const { from, to } = gradientForBook(book);
  const fonts = FONT_SIZES[book.size];

  return (
    <div
      className={`bento-tile tile-${book.size}${hovered ? " bento-tile--hovered" : ""}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
// Vinyls data
// ---------------------------------------------------------------------------

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
}

const VINYLS: Vinyl[] = [
  { id: "for-broken-ears",    title: "For Broken Ears",                    artist: "Tems",           year: 2020, genre: "Afro R&B" },
  { id: "untitled-unmastered",title: "untitled unmastered.",               artist: "Kendrick Lamar", year: 2016, genre: "Hip-hop" },
  { id: "gnx",               title: "GNX",                               artist: "Kendrick Lamar", year: 2024, genre: "Hip-hop" },
  { id: "iyrtitl",           title: "If You're Reading This It's Too Late",artist: "Drake",          year: 2015, genre: "Hip-hop" },
  { id: "african-giant",     title: "African Giant",                      artist: "Burna Boy",      year: 2019, genre: "Afrobeats" },
  { id: "i-told-them",       title: "I Told Them",                        artist: "Burna Boy",      year: 2023, genre: "Afrobeats" },
  { id: "lungu-boy",         title: "Lungu Boy",                          artist: "Asake",          year: 2024, genre: "Afrobeats" },
  { id: "wattba",            title: "What a Time to Be Alive",            artist: "Future & Drake", year: 2015, genre: "Hip-hop" },
  { id: "the-blueprint",     title: "The Blueprint",                      artist: "Jay-Z",          year: 2001, genre: "Hip-hop" },
  { id: "let-god-sort-em-out",title: "Let God Sort Em Out",               artist: "Clipse",         year: 2025, genre: "Hip-hop" },
];

// iTunes cover fetch with localStorage cache
const CACHE_PREFIX = "vinyl-cover-v1-";

async function fetchCoverUrl(vinyl: Vinyl): Promise<string | null> {
  const key = CACHE_PREFIX + vinyl.id;
  try {
    const cached = localStorage.getItem(key);
    if (cached !== null) return cached === "" ? null : cached;
  } catch (_) { /* ignore */ }

  try {
    const query = encodeURIComponent(`${vinyl.artist} ${vinyl.title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&entity=album&limit=1`
    );
    const data = await res.json();
    const url =
      data.results && data.results.length > 0
        ? (data.results[0].artworkUrl100 as string).replace("100x100bb", "600x600bb")
        : null;
    try { localStorage.setItem(key, url ?? ""); } catch (_) { /* ignore */ }
    return url;
  } catch (_) {
    return null;
  }
}

// VinylCard component
function VinylCard({ vinyl }: { vinyl: Vinyl }) {
  const [coverUrl, setCoverUrl] = useState<string | null | undefined>(undefined);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCoverUrl(vinyl).then((url) => {
      if (!cancelled) setCoverUrl(url);
    });
    return () => { cancelled = true; };
  }, [vinyl.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`vinyl-card${hovered ? " vinyl-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image or fallback tile */}
      {coverUrl ? (
        <img
          src={coverUrl}
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
        {vinyl.genre}&nbsp;&middot;&nbsp;{vinyl.year}
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
