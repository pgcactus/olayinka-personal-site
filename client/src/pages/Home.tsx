/**
 * Design Philosophy: Minimal Monospace
 * - Pure white background, monospace type throughout
 * - Highlighter-yellow (#FEF08A) for key phrases, darkens to #FDE047 on hover
 * - Content centred horizontally and vertically in viewport
 * - Staggered fade-in on mount (300ms each, 80ms stagger)
 * - No nav, no footer, no extras — five paragraphs only
 */

import { motion } from "framer-motion";
import { Link } from "wouter";

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
        Right now, I lead product work across activation and trust at{" "}
        <Highlight href="https://www.flagstoneim.com/" external>
          Flagstone
        </Highlight>
        : getting people through the door and keeping things safe once
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
        quick 5K. Still, a slow afternoon with friends is usually the better
        version of a weekend.
      </>
    ),
  },
  {
    key: "p5",
    className: "para",
    content: (
      <>
        You can see the{" "}
        <Highlight href="/things?tab=books">books</Highlight> I&apos;ve read,
        the <Highlight href="/things?tab=vinyls">vinyls</Highlight> I&apos;m
        collecting, or the{" "}
        <Highlight href="/things?tab=places">places</Highlight> I&apos;ve been.
      </>
    ),
  },
];

export default function Home() {
  return (
    <div className="page-wrapper">
      <main className="content">
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
      </main>

      {/* LinkedIn utility link — fixed bottom-right, not part of the highlight system */}
      <motion.a
        href="https://www.linkedin.com/in/olayinkaetitilola/"
        target="_blank"
        rel="noopener noreferrer"
        className="linkedin-link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 }}
      >
        LinkedIn
      </motion.a>
    </div>
  );
}
