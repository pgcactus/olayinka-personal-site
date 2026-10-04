/**
 * /pace: a running pace calculator. Pick a distance, then type a finish time
 * to get the pace, or a pace to get the finish time, with splits.
 */

import { useState } from "react";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { useLang } from "@/lib/lang";
import {
  DISTANCES,
  KM_PER_MILE,
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
    mode: "Calculate",
    toPace: "time → pace",
    toTime: "pace → time",
    timeLabel: "Finish time",
    paceLabel: "Pace per km",
    timeHint: "25:00 or 1:52:30",
    paceHint: "5:00",
    invalid: "Use minutes and seconds, like 25:00.",
    pace: "pace",
    perKm: "/km",
    perMile: "/mile",
    finish: "finish",
    speed: "speed",
    kmh: "km/h",
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
    mode: "Calculer",
    toPace: "temps → allure",
    toTime: "allure → temps",
    timeLabel: "Temps final",
    paceLabel: "Allure au km",
    timeHint: "25:00 ou 1:52:30",
    paceHint: "5:00",
    invalid: "Indiquez des minutes et des secondes, comme 25:00.",
    pace: "allure",
    perKm: "/km",
    perMile: "/mile",
    finish: "arrivée",
    speed: "vitesse",
    kmh: "km/h",
    splits: "passages",
    km: (km: number) =>
      `${Number.isInteger(km) ? km : km.toFixed(1).replace(".", ",")} km`,
  },
};

type Mode = "toPace" | "toTime";

export default function Pace() {
  const lang = useLang();
  const t = STRINGS[lang];
  const [distance, setDistance] = useState<DistanceKey>("5k");
  const [mode, setMode] = useState<Mode>("toPace");
  const [time, setTime] = useState("25:00");
  const [pace, setPace] = useState("5:00");

  const km = DISTANCES[distance];
  const toPace = mode === "toPace";
  const value = toPace ? time : pace;
  const seconds = parseDuration(value);
  const perKm =
    seconds === null ? null : toPace ? pacePerKm(km, seconds) : seconds;
  const total =
    perKm === null ? null : toPace ? seconds! : finishTime(km, perKm);
  const fmtSpeed = (s: number) =>
    speedKmh(s)
      .toFixed(1)
      .replace(".", lang === "fr" ? "," : ".");

  return (
    <div className="site-page">
      <PageMeta
        title="Pace calculator — Olayinka Titilola"
        description="Work out your running pace from a finish time, or your finish time from a pace, with splits for 5K, 10K, half and full marathons."
        path="/pace"
      />
      <SiteHeader />
      <main className="pc">
        <div className="pc-heading">
          <h1 className="pc-title">{t.title}</h1>
          <p className="pc-sub">{t.sub}</p>
        </div>

        <div className="pc-controls">
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
          <div className="pc-chips" role="group" aria-label={t.mode}>
            <button
              type="button"
              aria-pressed={toPace}
              onClick={() => setMode("toPace")}
            >
              {t.toPace}
            </button>
            <button
              type="button"
              aria-pressed={!toPace}
              onClick={() => setMode("toTime")}
            >
              {t.toTime}
            </button>
          </div>
        </div>

        <div className="pc-field">
          <label htmlFor="pace-input" className="pc-label">
            {toPace ? t.timeLabel : t.paceLabel}
          </label>
          <input
            id="pace-input"
            className="pc-input"
            value={value}
            placeholder={toPace ? t.timeHint : t.paceHint}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={value.trim() !== "" && seconds === null}
            aria-describedby="pace-error"
            onChange={e =>
              (toPace ? setTime : setPace)(
                e.target.value.replace(/[^\d:]/g, "").slice(0, 8)
              )
            }
          />
          <p id="pace-error" className="pc-error" aria-live="polite">
            {value.trim() !== "" && seconds === null ? t.invalid : ""}
          </p>
        </div>

        {perKm !== null && total !== null && (
          <>
            <dl className="pc-results" aria-live="polite">
              <div>
                <dt>{toPace ? t.pace : t.finish}</dt>
                <dd className="pc-big">
                  {toPace ? formatDuration(perKm) : formatDuration(total)}
                  {toPace && <span>{t.perKm}</span>}
                </dd>
              </div>
              <div>
                <dt>{t.pace}</dt>
                <dd>
                  {formatDuration(perKm * KM_PER_MILE)}
                  <span>{t.perMile}</span>
                </dd>
              </div>
              <div>
                <dt>{t.speed}</dt>
                <dd>
                  {fmtSpeed(perKm)}
                  <span>{t.kmh}</span>
                </dd>
              </div>
            </dl>

            <section aria-labelledby="pace-splits">
              <h2 id="pace-splits" className="pc-label">
                {t.splits}
              </h2>
              <ol className="pc-splits">
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
