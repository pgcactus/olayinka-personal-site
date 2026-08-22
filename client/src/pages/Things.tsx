/**
 * Design Philosophy: Minimal Monospace — /things page
 * - Keep the white, text-first frame and restrained ice-blue highlights.
 * - Vinyls use physical shelf cues: square sleeves, a white ledge, and a disc
 *   that slips out on hover, keyboard focus, or an opened state.
 * - Every record is a semantic button; touch and keyboard use the same action.
 * - Detail panels are data-driven, Escape-closable, focus-aware, and motion-safe.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import VINYLS_RESOLVED from "../data/vinyls-resolved.json";
import PLACES_RESOLVED from "../data/places.json";
import NotFound from "@/pages/NotFound";
import PageMeta from "@/components/PageMeta";
import ThemeToggle from "@/components/ThemeToggle";

type Tab = "vinyls" | "places";

type Vinyl = {
  id: string;
  title: string;
  artist: string;
  year: number;
  label: string | null;
  note?: string;
  coverWebpUrl: string | null;
  coverUrl: string | null;
};

type Place = {
  city: string;
  country: string;
  countryCode: string;
  year: string;
  note: string;
  audio: string;
};

const VINYLS = VINYLS_RESOLVED as Vinyl[];
const PLACES = PLACES_RESOLVED as Place[];

function flagFromCountryCode(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return String.fromCodePoint(
    ...Array.from(normalized).map((character) => 0x1f1e6 + character.charCodeAt(0) - 65)
  );
}

function yearValue(year: string): number {
  const parsed = Number.parseInt(year, 10);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function splitIntoRows<T>(items: T[], perRow: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / perRow) }, (_, index) =>
    items.slice(index * perRow, index * perRow + perRow)
  );
}

function VinylCard({
  vinyl,
  active,
  onOpen,
  ordinal,
}: {
  vinyl: Vinyl;
  active: boolean;
  onOpen: (id: string, trigger: HTMLButtonElement | null) => void;
  ordinal: number;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={`vinyl-card${active ? " vinyl-card--active" : ""}`}
      aria-pressed={active}
      aria-label={`${active ? "Close" : "Open"} details for ${vinyl.title} by ${vinyl.artist}`}
      onClick={() => onOpen(vinyl.id, triggerRef.current)}
    >
      <span className="vinyl-art" aria-hidden="true">
        <span className="vinyl-disc">
          <span className="vinyl-disc-label" />
        </span>
        {vinyl.coverUrl ? (
          <picture className="vinyl-picture">
            {vinyl.coverWebpUrl && <source type="image/webp" srcSet={vinyl.coverWebpUrl} />}
            <img
              src={vinyl.coverUrl}
              alt=""
              className="vinyl-cover"
              width={400}
              height={400}
              loading={ordinal < 8 ? "eager" : "lazy"}
              fetchPriority={ordinal < 5 ? "high" : "auto"}
              decoding="async"
              draggable={false}
            />
          </picture>
        ) : (
          <span className="vinyl-fallback">
            <span className="vinyl-fallback-title">{vinyl.title}</span>
            <span className="vinyl-fallback-artist">{vinyl.artist}</span>
          </span>
        )}
        <span className="vinyl-card-open">{active ? "close" : "details"}</span>
      </span>
      <span className="vinyl-caption">
        <span className="vinyl-title">{vinyl.title}</span>
        <span className="vinyl-artist">{vinyl.artist}</span>
      </span>
    </button>
  );
}

function VinylDetailPanel({
  vinyl,
  onClose,
  returnFocusRef,
}: {
  vinyl: Vinyl;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = `vinyl-detail-${vinyl.id}`;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [vinyl.id]);

  function handleClose() {
    onClose();
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  return (
    <section
      ref={panelRef}
      className="vinyl-detail"
      aria-labelledby={titleId}
      aria-live="polite"
    >
      <button
        ref={closeRef}
        type="button"
        className="vinyl-detail-close"
        onClick={handleClose}
        aria-label={`Close details for ${vinyl.title}`}
      >
        close
      </button>
      <div className="vinyl-detail-art" aria-hidden="true">
        {vinyl.coverUrl ? (
          <picture className="vinyl-picture">
            {vinyl.coverWebpUrl && <source type="image/webp" srcSet={vinyl.coverWebpUrl} />}
            <img
              src={vinyl.coverUrl}
              alt=""
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <span className="vinyl-fallback">
            <span className="vinyl-fallback-title">{vinyl.title}</span>
            <span className="vinyl-fallback-artist">{vinyl.artist}</span>
          </span>
        )}
      </div>
      <div className="vinyl-detail-copy">
        <p className="vinyl-detail-kicker">record details</p>
        <h2 id={titleId}>{vinyl.title}</h2>
        <p className="vinyl-detail-artist">{vinyl.artist}</p>
        <dl className="vinyl-detail-facts">
          <div>
            <dt>year</dt>
            <dd>{vinyl.year}</dd>
          </div>
          {vinyl.label && (
            <div>
              <dt>label</dt>
              <dd>{vinyl.label}</dd>
            </div>
          )}
        </dl>
        {vinyl.note && <p className="vinyl-detail-note">{vinyl.note}</p>}
      </div>
    </section>
  );
}

function VinylShelf({ vinyls }: { vinyls: Vinyl[] }) {
  const [itemsPerRow, setItemsPerRow] = useState(5);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedVinyl = selectedId ? vinyls.find((vinyl) => vinyl.id === selectedId) ?? null : null;
  const returnFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      setItemsPerRow(width < 640 ? 2 : width < 1024 ? 3 : 5);
    };
    updateItemsPerRow();
    window.addEventListener("resize", updateItemsPerRow);
    return () => window.removeEventListener("resize", updateItemsPerRow);
  }, []);

  const rows = splitIntoRows(vinyls, itemsPerRow);
  const selectedRowIndex = selectedId
    ? rows.findIndex((row) => row.some((vinyl) => vinyl.id === selectedId))
    : -1;

  function handleOpen(id: string, trigger: HTMLButtonElement | null) {
    returnFocusRef.current = trigger;
    setSelectedId((current) => (current === id ? null : id));
  }

  function handleClose() {
    setSelectedId(null);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  return (
    <div className="shelf-section" aria-label="Vinyl record collection">
      {rows.map((row, rowIndex) => (
        <div className="shelf-group" key={row.map((vinyl) => vinyl.id).join("-")}>
          <div className="shelf-row">
            {row.map((vinyl, columnIndex) => (
              <VinylCard
                key={vinyl.id}
                vinyl={vinyl}
                active={vinyl.id === selectedId}
                onOpen={handleOpen}
                ordinal={rowIndex * itemsPerRow + columnIndex}
              />
            ))}
          </div>
          {selectedVinyl && selectedRowIndex === rowIndex && (
            <VinylDetailPanel
              vinyl={selectedVinyl}
              onClose={handleClose}
              returnFocusRef={returnFocusRef}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function audioFallbackPath(path: string): string {
  return path.replace(/\.m4a(?:\?.*)?$/i, ".mp3");
}

function PlacesSoundMap({ places }: { places: Place[] }) {
  const orderedPlaces = places
    .map((place, index) => ({ place, index }))
    .sort((a, b) => yearValue(b.place.year) - yearValue(a.place.year) || a.index - b.index)
    .map(({ place }) => place);
  const countryCount = new Set(places.map((place) => place.countryCode)).size;

  return (
    <section className="places-sound-map" aria-label="Sounds from places visited">
      <p className="places-summary">{places.length} places · {countryCount} countries</p>
      <p className="places-sound-note">Tap a place to hear it.</p>
      <ul className="place-sound-list">
        {orderedPlaces.map((place) => {
          const id = `${place.countryCode}:${place.city}`;
          const hasAudio = Boolean(place.audio);
          const rowContent = (
            <>
              <span
                className="place-sound-marker"
                data-place-marker
                data-place-flag={flagFromCountryCode(place.countryCode)}
                aria-hidden="true"
              >
                {flagFromCountryCode(place.countryCode)}
              </span>
              <span className="place-sound-city">{place.city}</span>
              <span className="place-sound-country">{place.country}</span>
              <span className="place-sound-year">
                {place.year ? <time dateTime={place.year}>{place.year}</time> : null}
              </span>
              <span className="sr-only" data-place-status aria-live="polite" />
            </>
          );

          return (
            <li key={id} className="place-sound-item">
              {hasAudio ? (
                <>
                  <button
                    type="button"
                    className="place-sound-row"
                    data-place-sound-button
                    data-place-id={id}
                    aria-label={`Play sound from ${place.city}`}
                    aria-pressed="false"
                  >
                    {rowContent}
                  </button>
                  <audio
                    data-place-audio
                    data-place-id={id}
                    data-audio-primary={place.audio}
                    data-audio-fallback={audioFallbackPath(place.audio)}
                    preload="none"
                    loop
                  />
                </>
              ) : (
                <div className="place-sound-row place-sound-row--unavailable">
                  {rowContent}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TABS: Tab[] = ["vinyls", "places"];

const TAB_META: Record<Tab, { title: string; description: string }> = {
  vinyls: {
    title: "Vinyls · Olayinka Titilola",
    description: "A few records Olayinka keeps returning to, with artist, year, and label information.",
  },
  places: {
    title: "Places · Olayinka Titilola",
    description: "A sound map of places Olayinka has visited, built from his own recordings.",
  },
};

function parseTab(raw: string | undefined): Tab | null {
  if (raw === "vinyls" || raw === "places") return raw;
  return null;
}

export default function Things() {
  const params = useParams<{ tab?: string }>();
  const [, navigate] = useLocation();
  const activeTab = parseTab(params.tab);

  if (!activeTab) return <NotFound />;

  const meta = TAB_META[activeTab];

  return (
    <div className="things-wrapper things-fade-in">
      <PageMeta
        title={meta.title}
        description={meta.description}
        path={`/things/${activeTab}`}
        preloadImages={
          activeTab === "vinyls"
            ? VINYLS.slice(0, 5).flatMap((vinyl) => vinyl.coverWebpUrl ? [vinyl.coverWebpUrl] : [])
            : []
        }
      />
      <div className="things-content">
        <Link href="/" className="things-back">
          Olayinka
        </Link>
        <ThemeToggle />
        <p className="things-intro">
          {activeTab === "vinyls"
            ? "A few records I keep returning to."
            : "Places I’ve been."
          }
        </p>
        <nav className="things-heading" aria-label="Things collections">
          {TABS.map((tab, index) => (
            <span key={tab}>
              <button
                type="button"
                className={`things-tab ${activeTab === tab ? "things-tab--active" : "things-tab--inactive"}`}
                aria-current={activeTab === tab ? "page" : undefined}
                onClick={() => navigate(`/things/${tab}`)}
              >
                {tab}
              </button>
              {index < TABS.length - 1 && <span className="things-dot">&nbsp;&middot;&nbsp;</span>}
            </span>
          ))}
        </nav>
        {activeTab === "vinyls" && <VinylShelf vinyls={VINYLS} />}
        {activeTab === "places" && <PlacesSoundMap places={PLACES} />}
      </div>
    </div>
  );
}
