/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by ?tab= query param via wouter useLocation
 * - Active tab: ice blue highlight #E0F2FE, darkens to #BAE6FD on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Books: uniform 2:3 portrait grid, captions below, lift-on-hover
 * - Vinyls: 5-col square grid from vinyls-resolved.json
 * - Places: interactive SVG world map, visited countries highlighted, click tooltip
 * - Page-level fade-in on mount via CSS animation (no framer-motion)
 * - Back link top-left, 13px, #5A5A5A, fades to 60% on hover
 */

import { useState } from "react";
import { BOOK_COVERS } from "@/assets/book-covers";
import VINYLS_RESOLVED from "../data/vinyls-resolved.json";
import BOOKS_RESOLVED from "../data/books-resolved.json";
import { Link, useLocation, useSearch } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import InteractiveMap from "@/components/InteractiveMap";

type Tab = "books" | "vinyls" | "places";

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
}

const BOOKS: Book[] = BOOKS_RESOLVED as Book[];

// ---------------------------------------------------------------------------
// BookItem — portrait cover + caption below, no text on cover
// ---------------------------------------------------------------------------

function BookItem({ book }: { book: Book }) {
  const bundledSrc = BOOK_COVERS[book.id] ?? book.coverUrl ?? null;
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = imgFailed ? null : bundledSrc;

  return (
    <div className="book-item">
      <div
        className="book-cover"
        style={
          resolvedSrc
            ? { backgroundImage: `url(${resolvedSrc})` }
            : undefined
        }
      >
        {resolvedSrc && (
          <img
            src={resolvedSrc}
            alt=""
            aria-hidden="true"
            onError={() => setImgFailed(true)}
            style={{ display: "none" }}
          />
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
    </div>
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
}

const VINYLS: Vinyl[] = VINYLS_RESOLVED as Vinyl[];

function VinylCard({ vinyl }: { vinyl: Vinyl }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`vinyl-card${hovered ? " vinyl-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
      <div className={`vinyl-overlay${hovered ? " vinyl-overlay--visible" : ""}`}>
        Released {vinyl.year}
      </div>
    </div>
  );
}

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
  const [, navigate] = useLocation();
  const activeTab = parseTab(search ? `?${search}` : "");

  function setTab(tab: Tab) {
    navigate(`/things?tab=${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="things-wrapper things-fade-in">
      <div className="things-content">
        {/* Back link */}
        <Link href="/" className="things-back">
          &#8627; back
        </Link>

        {/* Theme toggle — top-right of content block */}
        <ThemeToggle />

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

        {/* Books tab: shelf layout — 5 books per shelf row */}
        {activeTab === "books" && (
          <div className="shelf-section">
            {Array.from({ length: Math.ceil(BOOKS.length / 5) }, (_, rowIdx) => (
              <div key={rowIdx} className="shelf-row">
                {BOOKS.slice(rowIdx * 5, rowIdx * 5 + 5).map((book) => (
                  <BookItem key={book.id} book={book} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Vinyls tab: shelf layout — 5 vinyls per shelf row */}
        {activeTab === "vinyls" && (
          <div className="shelf-section">
            {Array.from({ length: Math.ceil(VINYLS.length / 5) }, (_, rowIdx) => (
              <div key={rowIdx} className="shelf-row">
                {VINYLS.slice(rowIdx * 5, rowIdx * 5 + 5).map((vinyl) => (
                  <VinylCard key={vinyl.id} vinyl={vinyl} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Places tab: interactive world map */}
        {activeTab === "places" && <InteractiveMap />}
      </div>
    </div>
  );
}
