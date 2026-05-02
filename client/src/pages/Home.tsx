/**
 * Design Philosophy: Minimal Monospace
 * - Pure white background, monospace type throughout
 * - Highlighter-yellow (#FEF08A) for key phrases, no border-radius, no underline
 * - Content centred horizontally and vertically in viewport
 * - No nav, no footer, no extras — five paragraphs only
 */

interface HighlightProps {
  children: React.ReactNode;
}

function Highlight({ children }: HighlightProps) {
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

export default function Home() {
  return (
    <div className="page-wrapper">
      <main className="content">
        {/* Paragraph 1 — bold, near-black */}
        <p className="para para-bold">Hi, I&apos;m Olayinka.</p>

        {/* Paragraph 2 — one highlight */}
        <p className="para">
          Right now I lead products at <Highlight>Flagstone</Highlight> that
          have to do two things at once: get people in and keep things safe.
        </p>

        {/* Paragraph 3 — two highlights */}
        <p className="para">
          Outside of work I also build small things on the side, like{" "}
          <Highlight>NATO Phonetic Alphabet</Highlight> and{" "}
          <Highlight>Basketball Companion</Highlight>.
        </p>

        {/* Paragraph 4 — no highlights */}
        <p className="para">
          I hike or skydive when I want a clean reset. A quick 5K, tennis, or a
          slow afternoon with friends is usually the better version of a
          weekend.
        </p>

        {/* Paragraph 5 — three highlights */}
        <p className="para">
          You can see the <Highlight>books</Highlight> I&apos;ve read, the{" "}
          <Highlight>vinyls</Highlight> I&apos;m collecting, or the{" "}
          <Highlight>places</Highlight> I&apos;ve been.
        </p>
      </main>
    </div>
  );
}
