import { useEffect, useState } from "react";
import {
  normaliseCountryCode,
  VISITED_COUNTRIES,
  VISITED_COUNTRY_CODES,
} from "@/data/visited-countries";

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

const MAP_W = 960;
const MAP_H = 480;

function project(
  lon: number,
  lat: number,
  width: number,
  height: number
): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function coordsToPath(
  rings: number[][][],
  width: number,
  height: number
): string {
  return rings
    .map(ring => {
      const points = ring.map(([lon, lat]) => project(lon, lat, width, height));
      return (
        points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"}${point[0].toFixed(2)},${point[1].toFixed(2)}`
          )
          .join(" ") + " Z"
      );
    })
    .join(" ");
}

function featureToPath(
  feature: GeoFeature,
  width: number,
  height: number
): string {
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") {
    return coordsToPath(coordinates as number[][][], width, height);
  }
  return (coordinates as number[][][][])
    .map(polygon => coordsToPath(polygon, width, height))
    .join(" ");
}

export default function InteractiveMap() {
  const [geoData, setGeoData] = useState<GeoCollection | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/world.geojson", { signal: controller.signal })
      .then(response => {
        if (!response.ok)
          throw new Error(`Map request failed: ${response.status}`);
        return response.json() as Promise<GeoCollection>;
      })
      .then(setGeoData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error("Failed to load world map:", error);
        setLoadError(true);
      });

    return () => controller.abort();
  }, []);

  const selected = selectedIso ? VISITED_COUNTRIES[selectedIso] : null;

  return (
    <section className="map-container" aria-labelledby="places-map-title">
      <h2 id="places-map-title" className="sr-only">
        Countries visited
      </h2>

      {geoData && !loadError ? (
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="map-svg"
          aria-label="World map with visited countries highlighted"
        >
          {geoData.features.map((feature, index) => {
            const iso2 = normaliseCountryCode(
              feature.properties.iso2,
              feature.properties.name
            );
            const visited = VISITED_COUNTRY_CODES.has(iso2);
            const active = selectedIso === iso2;
            const path = featureToPath(feature, MAP_W, MAP_H);
            if (!path) return null;

            const featureKey =
              iso2 && iso2 !== "-99"
                ? iso2
                : feature.properties.name || `feature-${index}`;

            return (
              <path
                key={featureKey}
                d={path}
                className={[
                  "map-country",
                  visited ? "map-country--visited" : "",
                  active ? "map-country--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role={visited ? "button" : undefined}
                tabIndex={visited ? 0 : undefined}
                aria-label={
                  visited
                    ? `${VISITED_COUNTRIES[iso2].name}. Show details.`
                    : undefined
                }
                aria-pressed={visited ? active : undefined}
                onClick={() => visited && setSelectedIso(iso2)}
                onKeyDown={event => {
                  if (visited && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    setSelectedIso(iso2);
                  }
                }}
              />
            );
          })}
        </svg>
      ) : (
        <div className="map-loading" role={loadError ? "alert" : "status"}>
          <span className="map-loading-text">
            {loadError ? "The map could not be loaded." : "Loading map…"}
          </span>
        </div>
      )}

      <p className="map-hint">
        Select a highlighted country or use the country list.
      </p>

      <div className="map-country-list" aria-label="Visited countries">
        {Object.entries(VISITED_COUNTRIES).map(([iso2, country]) => (
          <button
            key={iso2}
            type="button"
            className={`map-country-button${selectedIso === iso2 ? " map-country-button--active" : ""}`}
            onClick={() => setSelectedIso(iso2)}
            aria-pressed={selectedIso === iso2}
          >
            {country.name}
          </button>
        ))}
      </div>

      {selected && (
        <article className="map-detail" aria-live="polite">
          <h3 className="map-detail-title">{selected.name}</h3>
          <p className="map-detail-capital">Capital: {selected.capital}</p>
          <p className="map-detail-fact">{selected.fact}</p>
          <a
            href={selected.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-detail-source"
          >
            Source: {selected.sourceLabel} ↗
          </a>
        </article>
      )}

      <p className="map-counter">
        <strong>{VISITED_COUNTRY_CODES.size}</strong>{" "}
        {VISITED_COUNTRY_CODES.size === 1 ? "country" : "countries"} visited
      </p>
    </section>
  );
}
