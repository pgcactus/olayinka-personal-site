/**
 * /small-things: the little tools the home page's "small things" points to.
 */

import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { useLang } from "@/lib/lang";
import "./small-things.css";

const STRINGS = {
  en: {
    title: "Small things",
    sub: "Little tools I built because I wanted them.",
    open: "open →",
    items: [
      {
        href: "/nato",
        name: "NATO speller",
        line: "Type anything, get it spelled the radio way, and hear it read out.",
      },
      {
        href: "/pace",
        name: "Pace calculator",
        line: "Finish time to pace, or pace to finish time, with splits.",
      },
      {
        href: "/things/vinyls?pick",
        name: "Record picker",
        line: "Can’t decide what to play? Let the shelf choose.",
      },
    ],
  },
  fr: {
    title: "Petites choses",
    sub: "De petits outils que j’ai faits parce que j’en avais envie.",
    open: "ouvrir →",
    items: [
      {
        href: "/nato",
        name: "Épeleur OTAN",
        line: "Tapez n’importe quoi, obtenez l’épellation radio et écoutez-la.",
      },
      {
        href: "/pace",
        name: "Calculateur d’allure",
        line: "Du temps à l’allure, ou de l’allure au temps, avec les passages.",
      },
      {
        href: "/things/vinyls?pick",
        name: "Choix de disque",
        line: "Vous hésitez sur quoi écouter ? Laissez l’étagère choisir.",
      },
    ],
  },
};

export default function SmallThings() {
  const t = STRINGS[useLang()];
  return (
    <div className="site-page">
      <PageMeta
        title="Small things — Olayinka Titilola"
        description="Little tools by Olayinka: a NATO alphabet speller, a running pace calculator and a record picker."
        path="/small-things"
      />
      <SiteHeader />
      <main className="st">
        <div className="st-heading">
          <h1 className="st-title">{t.title}</h1>
          <p className="st-sub">{t.sub}</p>
        </div>
        <ul className="st-list">
          {t.items.map(item => (
            <li key={item.href}>
              <Link href={item.href} className="st-card">
                <span className="st-name">{item.name}</span>
                <span className="st-line">{item.line}</span>
                <span className="st-open" aria-hidden="true">
                  {t.open}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
