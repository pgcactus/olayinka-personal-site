/**
 * 404 — the home page's notebook with a page torn out, a short note and two
 * ways back.
 */

import { useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { useLang } from "@/lib/lang";
import { createLineScene } from "@/lib/line-scene";
import "./not-found.css";

const STRINGS = {
  en: {
    title: "Page not found.",
    body: "The link is broken or the page has moved.",
    home: "← back home",
    vinyls: "see the vinyls →",
  },
  fr: {
    title: "Page introuvable.",
    body: "Le lien est cassé ou la page a changé de place.",
    home: "← retour à l’accueil",
    vinyls: "voir les vinyles →",
  },
};

export default function NotFound() {
  const t = STRINGS[useLang()];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = createLineScene(canvas, undefined, "lost");
    return () => scene.destroy();
  }, []);

  return (
    <div className="site-page">
      <PageMeta
        title="Page not found — Olayinka Titilola"
        description="This page does not exist."
        path="/404"
        noindex={true}
      />
      <SiteHeader />
      <main className="nf">
        <div className="nf-art">
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
        <div className="nf-copy">
          <h1 className="nf-title">{t.title}</h1>
          <p className="nf-body">{t.body}</p>
          <p className="nf-links">
            <Link href="/">{t.home}</Link>
            <Link href="/things/vinyls">{t.vinyls}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
