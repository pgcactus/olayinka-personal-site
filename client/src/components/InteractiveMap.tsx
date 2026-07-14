/**
 * InteractiveMap
 * World map rendered from GeoJSON via a simple equirectangular projection.
 * Visited countries are highlighted in yellow; clicking/tapping shows a
 * tooltip with country name, capital, and a fun obscure fact.
 * GeoJSON is fetched from /world.geojson (public folder) at runtime.
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Visited country data
// ---------------------------------------------------------------------------

interface CountryInfo {
  name: string;
  capital: string;
  fact: string;
}

const VISITED: Record<string, CountryInfo> = {
  FR: {
    name: "France",
    capital: "Paris",
    fact: "France is the most visited country in the world — yet the Eiffel Tower was originally meant to be dismantled after 20 years.",
  },
  IT: {
    name: "Italy",
    capital: "Rome",
    fact: "Italy has more UNESCO World Heritage Sites than any other country on Earth — 58 at last count.",
  },
  ME: {
    name: "Montenegro",
    capital: "Podgorica",
    fact: "Montenegro's name literally means 'Black Mountain' in Venetian Italian — and the country only declared independence in 2006.",
  },
  ES: {
    name: "Spain",
    capital: "Madrid",
    fact: "Spain has the second-largest number of UNESCO sites in Europe, and its national anthem is one of only four in the world with no official lyrics.",
  },
  CH: {
    name: "Switzerland",
    capital: "Bern",
    fact: "Switzerland has not been at war since 1815 and was the last country in Europe to give women the right to vote — in 1971.",
  },
  GB: {
    name: "United Kingdom",
    capital: "London",
    fact: "The UK is the only country in the world that does not include its name on its postage stamps — a privilege granted as the nation that invented them.",
  },
  US: {
    name: "United States",
    capital: "Washington D.C.",
    fact: "The US has no official national language at the federal level — English is used by convention, not by law.",
  },
  DE: {
    name: "Germany",
    capital: "Berlin",
    fact: "Germany has over 1,500 different types of beer and around 300 varieties of bread — both considered part of the national cultural heritage.",
  },
  BE: {
    name: "Belgium",
    capital: "Brussels",
    fact: "Belgium once went 589 days without a government — a world record — and the country barely noticed any disruption to daily life.",
  },
};

// ---------------------------------------------------------------------------
// GeoJSON types
// ---------------------------------------------------------------------------

interface GeoFeature {
  type: "Feature";
  properties: { iso2: string; name: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

// ---------------------------------------------------------------------------
// Projection helpers (equirectangular)
// ---------------------------------------------------------------------------

function project(lon: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function coordsToPath(rings: number[][][], width: number, height: number): string {
  return rings
    .map((ring) => {
      const pts = ring.map(([lon, lat]) => project(lon, lat, width, height));
      return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ") + " Z";
    })
    .join(" ");
}

function featureToPath(feat: GeoFeature, width: number, height: number): string {
  const { type, coordinates } = feat.geometry;
  if (type === "Polygon") {
    return coordsToPath(coordinates as number[][][], width, height);
  }
  return (coordinates as number[][][][])
    .map((poly) => coordsToPath(poly, width, height))
    .join(" ");
}

// Simple word-wrap helper
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TooltipState {
  iso2: string;
  x: number;
  y: number;
}

const MAP_W = 960;
const MAP_H = 480;
const TOOLTIP_W = 240;
const TOOLTIP_H = 120;

export default function InteractiveMap() {
  const [geoData, setGeoData] = useState<GeoCollection | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visitedSet = new Set(Object.keys(VISITED));

  // Fetch GeoJSON on mount
  useEffect(() => {
    fetch("/world.geojson")
      .then((r) => r.json())
      .then((data: GeoCollection) => setGeoData(data))
      .catch((err) => console.error("Failed to load world map:", err));
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const handleCountryClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent, iso2: string) => {
      if (!visitedSet.has(iso2)) return;
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const scaleX = MAP_W / rect.width;
      const scaleY = MAP_H / rect.height;
      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;

      setTooltip((prev) => (prev?.iso2 === iso2 ? null : { iso2, x: svgX, y: svgY }));
    },
    [visitedSet]
  );

  const tooltipInfo = tooltip ? VISITED[tooltip.iso2] : null;
  const tooltipX = tooltip
    ? Math.min(Math.max(tooltip.x - TOOLTIP_W / 2, 4), MAP_W - TOOLTIP_W - 4)
    : 0;
  const tooltipY = tooltip
    ? tooltip.y > MAP_H * 0.6
      ? tooltip.y - TOOLTIP_H - 16
      : tooltip.y + 16
    : 0;

  if (!geoData) {
    return (
      <div className="map-container map-loading">
        <span className="map-loading-text">Loading map...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="map-container">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="map-svg"
        aria-label="Interactive world map showing visited countries"
        onClick={() => setTooltip(null)}
      >
        {geoData.features.map((feat, idx) => {
          const iso2 = feat.properties.iso2;
          const visited = visitedSet.has(iso2);
          const isActive = tooltip?.iso2 === iso2;
          const d = featureToPath(feat, MAP_W, MAP_H);
          if (!d) return null;

          return (
            <path
              key={iso2 || feat.properties.name || `feat-${idx}`}
              d={d}
              className={[
                "map-country",
                visited ? "map-country--visited" : "",
                isActive ? "map-country--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                handleCountryClick(e, iso2);
              }}
              onTouchStart={(e) => handleCountryClick(e, iso2)}
              role={visited ? "button" : undefined}
              aria-label={visited ? `${feat.properties.name} — tap for details` : undefined}
            />
          );
        })}

        {/* Tooltip */}
        {tooltip && tooltipInfo && (
          <g transform={`translate(${tooltipX},${tooltipY})`} className="map-tooltip-group">
            <rect width={TOOLTIP_W} height={TOOLTIP_H} rx={3} className="map-tooltip-bg" />
            <text x={12} y={22} className="map-tooltip-country">
              {tooltipInfo.name}
            </text>
            <text x={12} y={38} className="map-tooltip-capital">
              Capital: {tooltipInfo.capital}
            </text>
            {wrapText(tooltipInfo.fact, 36).slice(0, 4).map((line, i) => (
              <text key={i} x={12} y={58 + i * 14} className="map-tooltip-fact">
                {line}
              </text>
            ))}
          </g>
        )}
      </svg>

      <p className="map-hint">
        Tap a highlighted country to learn something about it.
      </p>
      <p className="map-counter">
        <strong>{visitedSet.size}</strong> {visitedSet.size === 1 ? "country" : "countries"} visited
      </p>
    </div>
  );
}
