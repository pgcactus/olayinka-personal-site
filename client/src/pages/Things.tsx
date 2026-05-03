/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Same global tokens as home: white bg, monospace, 14px, 1.75 line-height
 * - Max content width 1000px, top-aligned (not vertically centred)
 * - Three tabs: books, vinyls, places — driven by ?tab= query param
 * - Active tab: yellow highlight #FEF08A, darkens to #FDE047 on hover
 * - Inactive tabs: muted #9CA3AF, no background
 * - Grid: 3 cols desktop / 2 tablet / 1 mobile, 32px gap, square cells #F5F5F5
 * - Page-level fade-in on mount (300ms, no stagger)
 * - Back link top-left, 13px, #5A5A5A, fades to 60% on hover
 */

import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

type Tab = "books" | "vinyls" | "places";

// ---------------------------------------------------------------------------
// Placeholder image generators (inline SVG data URIs)
// ---------------------------------------------------------------------------

function bookSvg(fill: string): string {
  // Portrait rectangle
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='84' viewBox='0 0 60 84'%3E%3Crect width='60' height='84' rx='2' fill='${encodeURIComponent(fill)}'/%3E%3C/svg%3E`;
}

function vinylSvg(fill: string): string {
  // Circle with small centre hole
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='${encodeURIComponent(fill)}'/%3E%3Ccircle cx='40' cy='40' r='6' fill='%23ffffff'/%3E%3C/svg%3E`;
}

function placeSvg(fill: string): string {
  // Landscape rectangle
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='66' viewBox='0 0 100 66'%3E%3Crect width='100' height='66' rx='2' fill='${encodeURIComponent(fill)}'/%3E%3C/svg%3E`;
}

// Muted colour palettes per category
const bookColours = [
  "#C9B8A8", "#B8C4C2", "#C4B8C9", "#B8C9BC",
  "#C9C4B8", "#B8BBC9", "#C9B8BC", "#C4C9B8",
  "#BEC4C9", "#C9BEB8",
];

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

interface Item {
  id: string;
  image: string;
  category: Tab;
}

const items: Item[] = [
  // Books (10 items)
  ...bookColours.map((c, i) => ({
    id: `book-${i}`,
    image: bookSvg(c),
    category: "books" as Tab,
  })),
  // Vinyls (10 items)
  ...vinylColours.map((c, i) => ({
    id: `vinyl-${i}`,
    image: vinylSvg(c),
    category: "vinyls" as Tab,
  })),
  // Places (10 items)
  ...placeColours.map((c, i) => ({
    id: `place-${i}`,
    image: placeSvg(c),
    category: "places" as Tab,
  })),
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TABS: Tab[] = ["books", "vinyls", "places"];

function parseTab(search: string): Tab {
  const params = new URLSearchParams(search);
  const raw = params.get("tab");
  if (raw === "vinyls" || raw === "places") return raw;
  return "books";
}

export default function Things() {
  const [location, navigate] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const activeTab = parseTab(search);

  function setTab(tab: Tab) {
    navigate(`/things?tab=${tab}`);
  }

  const visible = items.filter((item) => item.category === activeTab);

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

        {/* Grid */}
        <div className="things-grid">
          {visible.map((item) => (
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
      </div>
    </motion.div>
  );
}
