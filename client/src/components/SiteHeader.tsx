/**
 * SiteHeader — the "← home" link and LinkedIn, shared by every page except
 * home, which has its own header.
 */

import { Link } from "wouter";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-note">
        ← home
      </Link>
      <a
        className="site-note"
        href="https://www.linkedin.com/in/olayinkaetitilola/"
        target="_blank"
        rel="noopener noreferrer"
      >
        linkedin ↗
      </a>
    </header>
  );
}
