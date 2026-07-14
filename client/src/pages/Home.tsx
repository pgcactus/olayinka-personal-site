/**
 * Design Philosophy: Minimal Monospace
 * - Pure white background, monospace type throughout
 * - Ice blue (#E0F2FE) for key phrases, darkens to #BAE6FD on hover
 * - Content centred horizontally and vertically in viewport
 * - Staggered fade-in on mount via CSS animation (no framer-motion)
 * - No nav, no footer, no extras — five paragraphs only
 */

import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

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
    <span className="highlight">{children}</span>
  );
}

const paragraphs = [
  {
    key: "p1",
    className: "para para-bold home-para",
    style: { animationDelay: "0ms" },
    content: <>Hi, I&apos;m Olayinka.</>,
  },
  {
    key: "p2",
    className: "para home-para",
    style: { animationDelay: "80ms" },
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
    className: "para home-para",
    style: { animationDelay: "160ms" },
    content: (
      <>
        Outside of work, I build small things, like{" "}
        <Highlight href="/nato">NATO Phonetic Alphabet</Highlight> and{" "}
        <Highlight href="https://github.com/pgcactus/basketball-companion" external>
          Basketball Companion
        </Highlight>
        .
      </>
    ),
  },
  {
    key: "p4",
    className: "para home-para",
    style: { animationDelay: "240ms" },
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
    className: "para home-para",
    style: { animationDelay: "320ms" },
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
  return (
    <div className="page-wrapper">
      <main className="content">
        {/* Theme toggle — top-right of content block */}
        <ThemeToggle className="home-fade-in" />

        {paragraphs.map((para) => (
          <p
            key={para.key}
            className={para.className}
            style={para.style}
          >
            {para.content}
          </p>
        ))}

        {/* Utility links — bottom-right of content block */}
        <div className="home-links home-para" style={{ animationDelay: "400ms" }}>
          <a
            href="mailto:dlayinka@gmail.com"
            className="linkedin-link"
          >
            Email ↗
          </a>
          <a
            href="https://www.linkedin.com/in/olayinkaetitilola/"
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin-link"
          >
            LinkedIn ↗
          </a>
        </div>
      </main>
    </div>
  );
}
