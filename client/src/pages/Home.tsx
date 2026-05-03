/**
 * Design Philosophy: Minimal Monospace
 * - Pure white background, monospace type throughout
 * - Ice blue (#E0F2FE) for key phrases, darkens to #BAE6FD on hover
 * - Content centred horizontally and vertically in viewport
 * - Staggered fade-in on mount (300ms each, 80ms stagger)
 * - No nav, no footer, no extras — five paragraphs only
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

interface HighlightProps {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

function Highlight({ children, href, external }: HighlightProps) {
  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="highlight"
      >
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className="highlight">
        {children}
      </Link>
    );
  }

  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="highlight"
    >
      {children}
    </a>
  );
}

const paragraphs = [
  {
    key: "p1",
    className: "para para-bold",
    content: <>Hi, I&apos;m Olayinka.</>,
  },
  {
    key: "p2",
    className: "para",
    content: (
      <>
        Right now, I lead product work at{" "}
        <Highlight href="https://www.flagstoneim.com/" external>
          Flagstone
        </Highlight>
        : helping people get through the door, and keeping things safe once
        they&apos;re in.
      </>
    ),
  },
  {
    key: "p3",
    className: "para",
    content: (
      <>
        Outside of work, I build small things, like{" "}
        <Highlight href="/nato">NATO Phonetic Alphabet</Highlight> and{" "}
        <Highlight>Basketball Companion</Highlight>.
      </>
    ),
  },
  {
    key: "p4",
    className: "para",
    content: (
      <>
        I&apos;d happily skydive for a clean reset, play tennis, or do a
        quick 5K. A slow afternoon with friends is usually the better version
        of a weekend.
      </>
    ),
  },
  {
    key: "p5",
    className: "para",
    content: (
      <>
        You can see some of the{" "}
        <Highlight href="/things?tab=books">books</Highlight> I&apos;ve read,
        the <Highlight href="/things?tab=vinyls">vinyls</Highlight> I&apos;m
        collecting, or the{" "}
        <Highlight href="/things?tab=places">places</Highlight> I&apos;ve been
        to.
      </>
    ),
  },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-wrapper">
      <main className="content">
        {/* Theme toggle — top-right of content block */}
        <motion.button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0 }}
        >
          {theme === "light" ? (
            /* Moon icon — shown in light mode, click to go dark */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            /* Sun icon — shown in dark mode, click to go light */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </motion.button>
        {paragraphs.map((para, index) => (
          <motion.p
            key={para.key}
            className={para.className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: index * 0.08,
            }}
          >
            {para.content}
          </motion.p>
        ))}

        {/* LinkedIn utility link — anchored to bottom-right of content block */}
        <motion.a
          href="https://www.linkedin.com/in/olayinkaetitilola/"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 }}
        >
          LinkedIn ↗
        </motion.a>
      </main>
    </div>
  );
}
