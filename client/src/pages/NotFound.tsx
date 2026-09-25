/**
 * 404 — a dot-matrix "404" to poke, a short note and two ways back.
 */

import { Link } from "wouter";
import DotArt from "@/components/DotArt";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import "./not-found.css";

export default function NotFound() {
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
        <DotArt
          className="nf-art"
          drawing="sign404"
          caption="nothing on this shelf"
          hint="poke it"
        />
        <div className="nf-copy">
          <h1 className="nf-title">Page not found.</h1>
          <p className="nf-body">The link is broken or the page has moved.</p>
          <p className="nf-links">
            <Link href="/">← back home</Link>
            <Link href="/things/vinyls">see the vinyls →</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
