/**
 * SiteHeader — home, LinkedIn and the language switch as round buttons,
 * matching the header on the home page.
 */

import { Link } from "wouter";
import LangSwitch from "@/components/LangSwitch";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useLang } from "@/lib/lang";
import { LINKEDIN } from "@/lib/links";

export default function SiteHeader() {
  const lang = useLang();
  return (
    <header className="site-header">
      <Link href="/" className="site-round">
        {lang === "fr" ? "← accueil" : "← home"}
      </Link>
      <span className="site-actions">
        <a
          className="site-round site-round--icon"
          href={LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <LangSwitch className="site-round" />
      </span>
    </header>
  );
}
