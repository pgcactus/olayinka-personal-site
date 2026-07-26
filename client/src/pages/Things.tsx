/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by /things/:tab path route
 * - Active tab: ice blue highlight #E0F2FE, darkens to #BAE6FD on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Books: shelf rows, portrait covers, hover overlay, click-to-expand detail panel,
 *          category/year filter bar, "currently reading" badge on active book
 * - Vinyls: shelf rows, square covers, hover overlay, favourite track, 30s preview on click
 * - Places: interactive SVG world map, visited countries highlighted, click tooltip, country counter
 * - Page-level fade-in on mount via CSS animation (no framer-motion)
 * - Back link top-left, 13px, #5A5A5A, fades to 60% on hover
 */

import { useState, useRef, useEffect } from "react";
import { BOOK_COVERS } from "@/assets/book-covers";
import VINYLS_RESOLVED from "../data/vinyls-resolved.json";
import BOOKS_RESOLVED from "../data/books-resolved.json";
import { Link, Redirect, useParams } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import InteractiveMap from "@/components/InteractiveMap";
import PageMeta from "@/components/PageMeta";
import { ROUTE_META, type RouteMeta } from "@/site-meta";
import { parseThingsTab, THINGS_TABS, type ThingsTab } from "@/lib/routes";

// ---------------------------------------------------------------------------
// Books data
// ---------------------------------------------------------------------------

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number | string;
  read: number;
  isbn: string;
  coverUrl?: string;
  status?: "reading" | "read";
  note?: string;
}

const BOOKS = BOOKS_RESOLVED as Book[];

// Categories derived from data
const BOOK_CATEGORIES = [
  "all",
  ...Array.from(new Set(BOOKS.map(b => b.category))),
];
const BOOK_YEARS = [
  "all",
  ...Array.from(new Set(BOOKS.map(b => b.read)))
    .sort((a, b) => b - a)
    .map(String),
];

// ---------------------------------------------------------------------------
// BookItem — portrait cover + caption below + click-to-expand panel
// ---------------------------------------------------------------------------

function BookItem({
  book,
  onClick,
  isActive,
}: {
  book: Book;
  onClick: () => void;
  isActive: boolean;
}) {
  const bundledSrc = BOOK_COVERS[book.id] ?? book.coverUrl ?? null;
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = imgFailed ? null : bundledSrc;

  return (
    <button
      type="button"
      className={`book-item${isActive ? " book-item--active" : ""}`}
      onClick={onClick}
      aria-expanded={isActive}
      aria-controls={isActive ? `book-panel-${book.id}` : undefined}
    >
      <div className="book-cover">
        {resolvedSrc && (
          <img
            src={resolvedSrc}
            alt={`Cover of ${book.title} by ${book.author}`}
            className="book-cover-image"
            width="320"
            height="480"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {/* Currently reading badge */}
        {book.status === "reading" && (
          <div className="book-current-badge">reading</div>
        )}
        {/* Hover strip — slides up over cover only */}
        <div className="book-cover-overlay">
          Published {book.year}&nbsp;&middot;&nbsp;Read {book.read}
        </div>
      </div>
      <div className="book-meta">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// BookDetailPanel — slides in below the shelf row when a book is selected
// ---------------------------------------------------------------------------

function BookDetailPanel({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  const bundledSrc = BOOK_COVERS[book.id] ?? book.coverUrl ?? null;
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = imgFailed ? null : bundledSrc;
  const panelRef = useRef<HTMLElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Scroll panel into view
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [book.id]);

  return (
    <section
      className="book-panel"
      ref={panelRef}
      id={`book-panel-${book.id}`}
      aria-label={`Details for ${book.title}`}
    >
      <button
        type="button"
        className="book-panel-close"
        onClick={onClose}
        aria-label={`Close details for ${book.title}`}
      >
        &#x2715;
      </button>
      <div className="book-panel-inner">
        {resolvedSrc && (
          <div className="book-panel-cover-wrap">
            <img
              src={resolvedSrc}
              alt={book.title}
              className="book-panel-cover"
              width="144"
              height="216"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          </div>
        )}
        <div className="book-panel-info">
          <div className="book-panel-title">{book.title}</div>
          <div className="book-panel-author">{book.author}</div>
          <div className="book-panel-meta">
            <span>{book.category}</span>
            <span className="book-panel-dot">&middot;</span>
            <span>Published {book.year}</span>
            <span className="book-panel-dot">&middot;</span>
            <span>Read {book.read}</span>
          </div>
          {book.status === "reading" && (
            <div className="book-panel-current">Currently reading</div>
          )}
          {book.note && <p className="book-panel-note">{book.note}</p>}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vinyls data — pre-resolved at build time via scripts/resolve-vinyl-covers.mjs
// ---------------------------------------------------------------------------

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string | null;
  favouriteTrack?: string;
}

const VINYL_EXTRAS: Record<string, { favouriteTrack?: string }> = {
  "for-broken-ears": { favouriteTrack: "Found" },
  "untitled-unmastered": { favouriteTrack: "untitled 07" },
  gnx: { favouriteTrack: "wacced out murals" },
  iyrtitl: { favouriteTrack: "Know Yourself" },
  "african-giant": { favouriteTrack: "Ye" },
  "i-told-them": { favouriteTrack: "City Boys" },
  "lungu-boy": { favouriteTrack: "Lungu Boy" },
  wattba: { favouriteTrack: "Jumpman" },
  "the-blueprint": { favouriteTrack: "Izzo (H.O.V.A.)" },
  "let-god-sort-em-out": { favouriteTrack: "Birds & Bees" },
  mbdtf: { favouriteTrack: "Runaway" },
};

const VINYLS: Vinyl[] = (VINYLS_RESOLVED as Vinyl[]).map(v => ({
  ...v,
  ...(VINYL_EXTRAS[v.id] ?? {}),
}));

function VinylCard({ vinyl }: { vinyl: Vinyl }) {
  return (
    <figure className="vinyl-card">
      {vinyl.coverUrl ? (
        <img
          src={vinyl.coverUrl}
          alt={`${vinyl.title} by ${vinyl.artist}`}
          className="vinyl-cover"
          draggable={false}
          width="600"
          height="600"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="vinyl-fallback">
          <span className="vinyl-fallback-title">{vinyl.title}</span>
          <span className="vinyl-fallback-artist">{vinyl.artist}</span>
        </div>
      )}
      <figcaption className="vinyl-overlay">
        <span>Released {vinyl.year}</span>
        {vinyl.favouriteTrack && (
          <span className="vinyl-fav-track">
            &nbsp;&middot;&nbsp;Favourite: {vinyl.favouriteTrack}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Tab metadata
// ---------------------------------------------------------------------------

const TAB_META: Record<ThingsTab, RouteMeta> = {
  books: ROUTE_META.books,
  vinyls: ROUTE_META.vinyls,
  places: ROUTE_META.places,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Things() {
  const params = useParams<{ tab?: string }>();
  const activeTab = parseThingsTab(params.tab);

  if (!activeTab) {
    return <Redirect to="/things/books" replace />;
  }

  return <ThingsContent activeTab={activeTab} />;
}

function ThingsContent({ activeTab }: { activeTab: ThingsTab }) {
  // Books filter state
  const [catFilter, setCatFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Filtered books
  const filteredBooks = BOOKS.filter(b => {
    if (catFilter !== "all" && b.category !== catFilter) return false;
    if (yearFilter !== "all" && String(b.read) !== yearFilter) return false;
    return true;
  });

  const selectedBook = selectedBookId
    ? (BOOKS.find(b => b.id === selectedBookId) ?? null)
    : null;

  // Group filtered books into shelf rows of 5
  const shelfRows = Array.from(
    { length: Math.ceil(filteredBooks.length / 5) },
    (_, i) => filteredBooks.slice(i * 5, i * 5 + 5)
  );

  // Find which row the selected book is in (to insert panel after that row)
  const selectedRowIdx = selectedBookId
    ? shelfRows.findIndex(row => row.some(b => b.id === selectedBookId))
    : -1;

  const meta = TAB_META[activeTab];

  return (
    <div className="things-wrapper things-fade-in">
      <PageMeta meta={meta} />

      <main className="things-content">
        {/* Back link */}
        <Link href="/" className="things-back">
          &#8627; back
        </Link>

        {/* Theme toggle — top-right of content block */}
        <ThemeToggle />

        <h1 className="sr-only">
          {meta.title.replace(" — Olayinka Titilola", "")}
        </h1>

        {/* Heading / route navigation */}
        <nav className="things-heading" aria-label="Collections">
          {THINGS_TABS.map((tab, i) => (
            <span key={tab}>
              <Link
                href={`/things/${tab}`}
                className={`things-tab ${activeTab === tab ? "things-tab--active" : "things-tab--inactive"}`}
                aria-current={activeTab === tab ? "page" : undefined}
                onClick={() => setSelectedBookId(null)}
              >
                {tab}
              </Link>
              {i < THINGS_TABS.length - 1 && (
                <span className="things-dot">&nbsp;&middot;&nbsp;</span>
              )}
            </span>
          ))}
        </nav>

        {/* Books tab */}
        {activeTab === "books" && (
          <>
            {/* Filter bar */}
            <div className="books-filter-bar">
              <div className="books-filter-group">
                {BOOK_CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    className={`books-filter-btn${catFilter === cat ? " books-filter-btn--active" : ""}`}
                    onClick={() => {
                      setCatFilter(cat);
                      setSelectedBookId(null);
                    }}
                    aria-pressed={catFilter === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="books-filter-group">
                {BOOK_YEARS.map(yr => (
                  <button
                    type="button"
                    key={yr}
                    className={`books-filter-btn${yearFilter === yr ? " books-filter-btn--active" : ""}`}
                    onClick={() => {
                      setYearFilter(yr);
                      setSelectedBookId(null);
                    }}
                    aria-pressed={yearFilter === yr}
                  >
                    {yr === "all" ? "all years" : yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Shelf with inline detail panel */}
            <div className="shelf-section">
              {shelfRows.map((row, rowIdx) => (
                <div key={rowIdx}>
                  <div className="shelf-row">
                    {row.map(book => (
                      <BookItem
                        key={book.id}
                        book={book}
                        isActive={book.id === selectedBookId}
                        onClick={() =>
                          setSelectedBookId(
                            book.id === selectedBookId ? null : book.id
                          )
                        }
                      />
                    ))}
                  </div>
                  {/* Detail panel inserts after the row containing the selected book */}
                  {selectedBook && selectedRowIdx === rowIdx && (
                    <BookDetailPanel
                      book={selectedBook}
                      onClose={() => setSelectedBookId(null)}
                    />
                  )}
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <p className="books-empty">No books match this filter.</p>
              )}
            </div>
          </>
        )}

        {/* Vinyls tab: shelf layout — 5 vinyls per shelf row */}
        {activeTab === "vinyls" && (
          <div className="shelf-section">
            {Array.from(
              { length: Math.ceil(VINYLS.length / 5) },
              (_, rowIdx) => (
                <div key={rowIdx} className="shelf-row">
                  {VINYLS.slice(rowIdx * 5, rowIdx * 5 + 5).map(vinyl => (
                    <VinylCard key={vinyl.id} vinyl={vinyl} />
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Places tab: interactive world map */}
        {activeTab === "places" && <InteractiveMap />}
      </main>
    </div>
  );
}
