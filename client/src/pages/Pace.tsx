/**
 * /pace: a running pace calculator. Pick a distance, type a finish time, get
 * the pace per km, the speed, splits and what the same pace means over the
 * other distances.
 */

import { useState } from "react";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { useLang } from "@/lib/lang";
import {
  DISTANCES,
  finishTime,
  formatDuration,
  pacePerKm,
  parseDuration,
  speedKmh,
  splits,
  type DistanceKey,
} from "@/lib/pace";
import "./pace.css";

const STRINGS = {
  en: {
    title: "Pace calculator",
    sub: "How fast was that 5K, really?",
    distance: "Distance",
    distances: { "5k": "5K", "10k": "10K", half: "Half", marathon: "Marathon" },
    timeLabel: "Finish time",
    timeHint: "25:00 or 1:52:30",
    invalid: "Use minutes and seconds, like 25:00.",
    pace: "pace",
    perKm: "/km",
    speed: "speed",
    kmh: "km/h",
    atThisPace: "at this pace",
    splits: "splits",
    km: (km: number) => `${Number.isInteger(km) ? km : km.toFixed(1)} km`,
  },
  fr: {
    title: "Calculateur d’allure",
    sub: "Ce 5 km, à quelle allure, vraiment ?",
    distance: "Distance",
    distances: {
      "5k": "5 km",
      "10k": "10 km",
      half: "Semi",
      marathon: "Marathon",
    },
    timeLabel: "Temps final",
    timeHint: "25:00 ou 1:52:30",
    invalid: "Indiquez des minutes et des secondes, comme 25:00.",
    pace: "allure",
    perKm: "/km",
    speed: "vitesse",
    kmh: "km/h",
    atThisPace: "à cette allure",
    splits: "passages",
    km: (km: number) =>
      `${Number.isInteger(km) ? km : km.toFixed(1).replace(".", ",")} km`,
  },
};

export default function Pace() {
  const lang = useLang();
  const t = STRINGS[lang];
  const [distance, setDistance] = useState<DistanceKey>("5k");
  const [time, setTime] = useState("25:00");

  const km = DISTANCES[distance];
  const seconds = parseDuration(time);
  const perKm = seconds === null ? null : pacePerKm(km, seconds);
  const invalid = time.trim() !== "" && seconds === null;
  const speed = (s: number) =>
    speedKmh(s)
      .toFixed(1)
      .replace(".", lang === "fr" ? "," : ".");
  const others = (Object.keys(DISTANCES) as DistanceKey[]).filter(
    key => key !== distance
  );

  return (
    <div className="site-page">
      <PageMeta
        title="Pace calculator — Olayinka Titilola"
        description="Work out your running pace from a finish time, with splits and what that pace means for 5K, 10K, half and full marathons."
        path="/pace"
        image="/og-pace.png"
      />
      <SiteHeader back="things" />
      <main className="pc">
        <div className="pc-heading">
          <h1 className="pc-title">{t.title}</h1>
          <p className="pc-sub">{t.sub}</p>
        </div>

        <div className="pc-chips" role="group" aria-label={t.distance}>
          {(Object.keys(DISTANCES) as DistanceKey[]).map(key => (
            <button
              key={key}
              type="button"
              aria-pressed={distance === key}
              onClick={() => setDistance(key)}
            >
              {t.distances[key]}
            </button>
          ))}
        </div>

        <div className="pc-field">
          <label htmlFor="pace-input" className="pc-label">
            {t.timeLabel}
          </label>
          <input
            id="pace-input"
            className="pc-input"
            value={time}
            placeholder={t.timeHint}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid}
            aria-describedby="pace-error"
            onChange={e =>
              setTime(e.target.value.replace(/[^\d:]/g, "").slice(0, 8))
            }
          />
          <p id="pace-error" className="pc-error" aria-live="polite">
            {invalid ? t.invalid : ""}
          </p>
        </div>

        {perKm !== null && (
          <>
            <dl className="pc-results" aria-live="polite">
              <div>
                <dt>{t.pace}</dt>
                <dd className="pc-big">
                  {formatDuration(perKm)}
                  <span>{t.perKm}</span>
                </dd>
              </div>
              <div>
                <dt>{t.speed}</dt>
                <dd>
                  {speed(perKm)}
                  <span>{t.kmh}</span>
                </dd>
              </div>
            </dl>

            <section aria-labelledby="pace-others">
              <h2 id="pace-others" className="pc-label">
                {t.atThisPace}
              </h2>
              <ul className="pc-rows pc-rows--wide">
                {others.map(key => (
                  <li key={key}>
                    <span>{t.distances[key]}</span>
                    <span>
                      {formatDuration(finishTime(DISTANCES[key], perKm))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="pace-splits">
              <h2 id="pace-splits" className="pc-label">
                {t.splits}
              </h2>
              <ol className="pc-rows">
                {splits(km, perKm).map(split => (
                  <li key={split.km}>
                    <span>{t.km(split.km)}</span>
                    <span>{formatDuration(split.seconds)}</span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
