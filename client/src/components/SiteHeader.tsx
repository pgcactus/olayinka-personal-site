/**
 * SiteHeader — the "← home" link and day/night switch shared by every page
 * except home, which has its own corner notes.
 */

import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="site-header">
      <Link href="/" className="site-note">
        ← home
      </Link>
      <button
        type="button"
        className="site-note"
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
      >
        ( {theme === "dark" ? "day mode" : "night mode"} )
      </button>
    </header>
  );
}
