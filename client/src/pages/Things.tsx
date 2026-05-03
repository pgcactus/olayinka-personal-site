/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by ?tab= query param
 * - Active tab: ice blue highlight #E0F2FE, darkens to #BAE6FD on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Books: programmatic gradient tiles, hover strip, category labels
 * - Vinyls / Places: placeholder SVG grid (unchanged)
 * - Page-level fade-in on mount (300ms, no stagger)
 * - Back link top-left, 13px, #5A5A5A, fades to 60% on hover
 */

import { useState } from "react";
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

interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number | string;
  read: number;
}

const BOOKS: Book[] = [
  { id: "playing-to-win", title: "Playing to Win", author: "A.G. Lafley & Roger Martin", category: "business", year: 2013, read: 2024 },
  { id: "the-score-takes-care-of-itself", title: "The Score Takes Care of Itself", author: "Bill Walsh", category: "business", year: 2009, read: 2025 },
  { id: "how-to-measure-anything", title: "How to Measure Anything", author: "Douglas Hubbard", category: "product", year: 2007, read: 2024 },
  { id: "thinking-in-systems", title: "Thinking in Systems", author: "Donella H. Meadows", category: "product", year: 2008, read: 2025 },
  { id: "human-powered", title: "Human Powered", author: "Trenton Moss", category: "product", year: 2021, read: 2024 },
  { id: "inspired", title: "Inspired", author: "Marty Cagan", category: "product", year: 2008, read: 2026 },
  { id: "burmese-days", title: "Burmese Days", author: "George Orwell", category: "classics", year: 1934, read: 2025 },
  { id: "nineteen-eighty-four", title: "Nineteen Eighty-Four", author: "George Orwell", category: "classics", year: 1949, read: 2024 },
  { id: "to-kill-a-mockingbird", title: "To Kill a Mockingbird", author: "Harper Lee", category: "classics", year: 1960, read: 2024 },
  { id: "the-odyssey", title: "The Odyssey", author: "Homer", category: "classics", year: "~700 BC", read: 2026 },
  { id: "dr-jekyll", title: "Dr Jekyll and Mr Hyde", author: "Robert Louis Stevenson", category: "classics", year: 1886, read: 2025 },
  { id: "the-raven", title: "The Raven and Other Tales", author: "Edgar Allan Poe", category: "classics", year: 1845, read: 2025 },
  { id: "simply-lies", title: "Simply Lies", author: "David Baldacci", category: "thrillers", year: 2023, read: 2024 },
  { id: "the-24th-hour", title: "The 24th Hour", author: "James Patterson", category: "thrillers", year: 2024, read: 2024 },
  { id: "the-exchange", title: "The Exchange", author: "John Grisham", category: "thrillers", year: 2023, read: 2025 },
  { id: "how-to-kill-your-family", title: "How to Kill Your Family", author: "Bella Mackie", category: "thrillers", year: 2021, read: 2025 },
  { id: "vera-wong", title: "Vera Wong's Unsolicited Advice for Murderers", author: "Jesse Q. Sutanto", category: "thrillers", year: 2023, read: 2026 },
  { id: "the-satsuma-complex", title: "The Satsuma Complex", author: "Bob Mortimer", category: "thrillers", year: 2022, read: 2026 },
  { id: "outliers", title: "Outliers", author: "Malcolm Gladwell", category: "nonfiction", year: 2008, read: 2024 },
];

const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  business: "Business and Strategy",
  product: "Product and Design",
  classics: "Classics",
  thrillers: "Thrillers and Crime Fiction",
  nonfiction: "Non-Fiction",
};

const BOOK_CATEGORY_ORDER: BookCategory[] = [
  "business",
  "product",
  "classics",
  "thrillers",
  "nonfiction",
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
// BookCard — gradient tile with hover strip
// ---------------------------------------------------------------------------

function BookCard({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);
  const { from, to } = gradientForBook(book);

  return (
    <div
      className={`book-tile ${hovered ? "book-tile--hovered" : ""}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title — top-left */}
      <span className="book-tile-title">{book.title}</span>

      {/* Author — bottom-left */}
      <span className="book-tile-author">{book.author}</span>

      {/* Hover strip — slides up from bottom */}
      <div className={`book-tile-strip ${hovered ? "book-tile-strip--visible" : ""}`}>
        Published {book.year}&nbsp;&middot;&nbsp;Read {book.read}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder image generators for vinyls / places (unchanged)
// ---------------------------------------------------------------------------

function vinylSvg(fill: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='${encodeURIComponent(fill)}'/%3E%3Ccircle cx='40' cy='40' r='6' fill='%23ffffff'/%3E%3C/svg%3E`;
}

function placeSvg(fill: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='66' viewBox='0 0 100 66'%3E%3Crect width='100' height='66' rx='2' fill='${encodeURIComponent(fill)}'/%3E%3C/svg%3E`;
}

const vinylColours = [
  "#4A4A5A", "#5A4A4A", "#4A5A4A", "#5A5A4A",
  "#4A5A5A", "#5A4A5A", "#4E4A5A", "#5A4E4A",
  "#4A5A52", "#52504A",
];

const placeColours = [
  "#A8B8C9", "#B8A8C4", "#A8C4B8", "#C4A8B8",
  "#B8C4A8", "#A8B8B8", "#C4B8A8", "#B8A8B8",
  "#A8C4C4", "#C4A8A8",
];

interface PlaceholderItem {
  id: string;
  image: string;
  category: "vinyls" | "places";
}

const placeholderItems: PlaceholderItem[] = [
  ...vinylColours.map((c, i) => ({ id: `vinyl-${i}`, image: vinylSvg(c), category: "vinyls" as const })),
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

        {/* Books tab: grouped by category */}
        {activeTab === "books" && (
          <div className="books-sections">
            {BOOK_CATEGORY_ORDER.map((cat) => {
              const group = BOOKS.filter((b) => b.category === cat);
              if (group.length === 0) return null;
              return (
                <div key={cat} className="books-group">
                  <p className="books-group-label">
                    {BOOK_CATEGORY_LABELS[cat]}
                  </p>
                  <div className="books-grid">
                    {group.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vinyls / Places tabs: placeholder grid */}
        {activeTab !== "books" && (
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
