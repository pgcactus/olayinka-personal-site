/**
 * SiteHeader — "← home", LinkedIn and the language switch, shared by every
 * page except home, which has its own header.
 */

import { Link } from "wouter";
import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/lib/lang";

export default function SiteHeader() {
  const lang = useLang();
  return (
    <header className="site-header">
      <Link href="/" className="site-note">
        {lang === "fr" ? "← accueil" : "← home"}
      </Link>
      <span className="site-actions">
        <a
          className="site-note"
          href="https://www.linkedin.com/in/olayinkaetitilola/"
          target="_blank"
          rel="noopener noreferrer"
        >
          linkedin ↗
        </a>
        <LangSwitch className="site-note site-lang" />
      </span>
    </header>
  );
}
