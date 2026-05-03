/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by ?tab= query param
 * - Active tab: yellow highlight #FEF08A, darkens to #FDE047 on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Books: real data with Open Library covers, hover tooltip, category labels
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
  isbn: string;
  category: BookCategory;
  caption?: string;
}

const BOOKS: Book[] = [
  { id: "playing-to-win", title: "Playing to Win", author: "A.G. Lafley & Roger Martin", isbn: "9781422187395", category: "business" },
  { id: "the-score-takes-care-of-itself", title: "The Score Takes Care of Itself", author: "Bill Walsh", isbn: "9781591843474", category: "business" },
  { id: "how-to-measure-anything", title: "How to Measure Anything", author: "Douglas Hubbard", isbn: "9781118539279", category: "product" },
  { id: "thinking-in-systems", title: "Thinking in Systems", author: "Donella H. Meadows", isbn: "9781603580557", category: "product" },
  { id: "human-powered", title: "Human Powered", author: "Trenton Moss", isbn: "9781781337691", category: "product" },
  { id: "inspired", title: "Inspired", author: "Marty Cagan", isbn: "9781119387503", category: "product" },
  { id: "burmese-days", title: "Burmese Days", author: "George Orwell", isbn: "9780141185378", category: "classics" },
  { id: "nineteen-eighty-four", title: "Nineteen Eighty-Four", author: "George Orwell", isbn: "9780451524935", category: "classics" },
  { id: "to-kill-a-mockingbird", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780446310789", category: "classics" },
  { id: "the-odyssey", title: "The Odyssey", author: "Homer", isbn: "9780140268867", category: "classics" },
  { id: "dr-jekyll-and-mr-hyde", title: "Dr Jekyll and Mr Hyde and Other Strange Tales", author: "Robert Louis Stevenson", isbn: "9780141439730", category: "classics" },
  { id: "the-raven", title: "The Raven and Other Tales of Horror", author: "Edgar Allan Poe", isbn: "9780140437546", category: "classics" },
  { id: "simply-lies", title: "Simply Lies", author: "David Baldacci", isbn: "9781538719893", category: "thrillers" },
  { id: "the-24th-hour", title: "The 24th Hour", author: "James Patterson", isbn: "9780316404815", category: "thrillers" },
  { id: "the-exchange", title: "The Exchange", author: "John Grisham", isbn: "9780385549325", category: "thrillers" },
  { id: "how-to-kill-your-family", title: "How to Kill Your Family", author: "Bella Mackie", isbn: "9780008365974", category: "thrillers" },
  { id: "vera-wong", title: "Vera Wong's Unsolicited Advice for Murderers", author: "Jesse Q. Sutanto", isbn: "9780593546192", category: "thrillers" },
  { id: "the-satsuma-complex", title: "The Satsuma Complex", author: "Bob Mortimer", isbn: "9781398519312", category: "thrillers" },
  { id: "outliers", title: "Outliers", author: "Malcolm Gladwell", isbn: "9780316017930", category: "nonfiction" },
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

// Books that are known to be missing from both Google Books and Open Library.
// These skip the API cascade and go straight to the local path.
const LOCAL_ONLY_BOOKS = new Set([
  "human-powered",
  "the-24th-hour",
  "the-exchange",
  "how-to-kill-your-family",
  "vera-wong",
  "the-satsuma-complex",
]);

// Build the ordered list of cover URLs to try for a given book.
function getCoverSources(book: Book): string[] {
  if (LOCAL_ONLY_BOOKS.has(book.id)) {
    return [`/images/books/${book.id}.jpg`];
  }
  return [
    // 1. Google Books thumbnail (http → https, strip edge=curl)
    `https://books.google.com/books/content?vid=ISBN${book.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`,
    // 2. Open Library large cover
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
    // 3. Local file (user-supplied)
    `/images/books/${book.id}.jpg`,
  ];
}

// ---------------------------------------------------------------------------
// BookCard — multi-source fallback chain
// ---------------------------------------------------------------------------

function BookCard({ book }: { book: Book }) {
  const sources = getCoverSources(book);
  const [srcIndex, setSrcIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleError() {
    const next = srcIndex + 1;
    if (next < sources.length) {
      setSrcIndex(next);
    } else {
      setAllFailed(true);
    }
  }

  return (
    <div
      className={`book-card ${hovered ? "book-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image area */}
      <div className="book-cover-frame">
        {allFailed ? (
          <div className="book-fallback">
            <span className="book-fallback-title">{book.title}</span>
          </div>
        ) : (
          <img
            key={sources[srcIndex]}
            src={sources[srcIndex]}
            alt={book.title}
            className="book-cover"
            loading="lazy"
            onError={handleError}
            draggable={false}
          />
        )}
      </div>

      {/* Title below cover */}
      <p className="book-title-label">{book.title}</p>
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
                  <div className="things-grid">
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
