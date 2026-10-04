/**
 * SiteHeader — a back button, LinkedIn and the language switch as round
 * buttons, matching the header on the home page. Tools pass back="things"
 * so their back button returns to the small things list.
 */

import { Link } from "wouter";
import LangSwitch from "@/components/LangSwitch";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useLang } from "@/lib/lang";
import { LINKEDIN } from "@/lib/links";

const BACK = {
  home: { href: "/", en: "← home", fr: "← accueil" },
  things: {
    href: "/small-things",
    en: "← small things",
    fr: "← petites choses",
  },
};

export default function SiteHeader({
  back = "home",
}: {
  back?: keyof typeof BACK;
}) {
  const lang = useLang();
  const target = BACK[back];
  return (
    <header className="site-header">
      <Link href={target.href} className="site-round">
        {target[lang]}
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
