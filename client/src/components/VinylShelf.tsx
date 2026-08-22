/**
 * VinylShelf — CSS-first 3D record shelf experience
 * - Responsive grid: 5 records on desktop, 3 on tablet, 2 on mobile
 * - CSS 3D transforms for depth, lift, and tilt on hover
 * - Detail panel with album info, personal notes, and audio preview
 * - Full keyboard and touch accessibility
 * - Respects prefers-reduced-motion
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

interface Vinyl {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  previewUrl?: string;
  favouriteTrack?: string;
  personalNote?: string;
}

interface VinylShelfProps {
  vinyls: Vinyl[];
}

export default function VinylShelf({ vinyls }: VinylShelfProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const shelfRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Track mouse position for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = shelfRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  // Close detail panel on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close detail panel on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedId(null);
  };

  const selected = vinyls.find((v) => v.id === selectedId);

  // Group vinyls into rows (5 on desktop, 3 on tablet, 2 on mobile)
  const getRowSize = () => {
    if (typeof window === "undefined") return 5;
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    return 5;
  };

  const [rowSize, setRowSize] = useState(5);

  useEffect(() => {
    setRowSize(getRowSize());
    const handleResize = () => setRowSize(getRowSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rows = [];
  for (let i = 0; i < vinyls.length; i += rowSize) {
    rows.push(vinyls.slice(i, i + rowSize));
  }

  return (
    <div className="vinyl-shelf-container">
      {/* Header */}
      <header className="vinyl-shelf-header">
        <div className="vinyl-shelf-intro">Records I keep coming back to.</div>
        <div className="vinyl-shelf-nav">
          <a href="/" className="vinyl-shelf-back">↳ back</a>
        </div>
      </header>

      {/* Main shelf area */}
      <div
        className="vinyl-shelf"
        ref={shelfRef}
        onMouseMove={handleMouseMove}
        role="region"
        aria-label="Record collection"
      >
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="vinyl-row">
            {row.map((vinyl) => (
              <VinylCard
                key={vinyl.id}
                vinyl={vinyl}
                isSelected={selectedId === vinyl.id}
                onSelect={() => setSelectedId(vinyl.id)}
                mousePos={mousePos}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Detail panel backdrop and modal */}
      {selectedId && (
        <div
          className="vinyl-detail-backdrop"
          onClick={handleBackdropClick}
          role="presentation"
        >
          <div
            className="vinyl-detail-panel"
            ref={detailRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vinyl-detail-title"
          >
            {selected && (
              <>
                <div className="vinyl-detail-cover">
                  <img src={selected.coverUrl} alt={`${selected.title} cover`} />
                </div>
                <div className="vinyl-detail-info">
                  <h2 id="vinyl-detail-title" className="vinyl-detail-title">
                    {selected.title}
                  </h2>
                  <p className="vinyl-detail-artist">{selected.artist}</p>
                  <p className="vinyl-detail-year">{selected.year}</p>

                  {selected.favouriteTrack && (
                    <p className="vinyl-detail-track">
                      <strong>Favourite:</strong> {selected.favouriteTrack}
                    </p>
                  )}

                  {selected.personalNote && (
                    <p className="vinyl-detail-note">{selected.personalNote}</p>
                  )}

                  {selected.previewUrl && (
                    <audio
                      controls
                      src={selected.previewUrl}
                      className="vinyl-detail-audio"
                      aria-label={`Preview of ${selected.title}`}
                    />
                  )}

                  <button
                    className="vinyl-detail-close"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close detail panel"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VinylCard — Individual record with 3D transforms
// ---------------------------------------------------------------------------

interface VinylCardProps {
  vinyl: Vinyl;
  isSelected: boolean;
  onSelect: () => void;
  mousePos: { x: number; y: number };
  prefersReducedMotion: boolean;
}

function VinylCard({
  vinyl,
  isSelected,
  onSelect,
  mousePos,
  prefersReducedMotion,
}: VinylCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate tilt based on mouse position
  const tiltX = prefersReducedMotion ? 0 : (mousePos.y - 0.5) * 8;
  const tiltY = prefersReducedMotion ? 0 : (mousePos.x - 0.5) * 8;

  return (
    <button
      className={`vinyl-card${isHovered && !prefersReducedMotion ? " vinyl-card--hovered" : ""}${
        isSelected ? " vinyl-card--selected" : ""
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      style={{
        transform: !prefersReducedMotion
          ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${
              isHovered ? 20 : 0
            }px)`
          : undefined,
      }}
      aria-pressed={isSelected}
      aria-label={`${vinyl.title} by ${vinyl.artist}`}
    >
      <div className="vinyl-card-inner">
        <img
          src={vinyl.coverUrl}
          alt={`${vinyl.title} cover`}
          className="vinyl-card-image"
        />
        <div className="vinyl-card-edge" />
        <div className="vinyl-card-shadow" />
      </div>
    </button>
  );
}
