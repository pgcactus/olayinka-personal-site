/**
 * /nato — NATO Phonetic Alphabet tool
 *
 * Features:
 * - Real-time conversion with bullet separators and / word boundaries
 * - Dark/light mode toggle, persisted to localStorage, defaults to system pref
 * - Collapsible "Learn about these words" panel with word origins
 * - Copy output and Share tool action buttons
 * - URL ?q= state: read on mount, written on share
 * - Footer linking to LinkedIn
 * - Input pre-filled with "HERMIONE", auto-focused, text pre-selected
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const NATO_MAP: Record<string, string> = {
  A: "Alfa",     B: "Bravo",    C: "Charlie",  D: "Delta",
  E: "Echo",     F: "Foxtrot",  G: "Golf",     H: "Hotel",
  I: "India",    J: "Juliett",  K: "Kilo",     L: "Lima",
  M: "Mike",     N: "November", O: "Oscar",    P: "Papa",
  Q: "Quebec",   R: "Romeo",    S: "Sierra",   T: "Tango",
  U: "Uniform",  V: "Victor",   W: "Whiskey",  X: "X-ray",
  Y: "Yankee",   Z: "Zulu",
  "0": "Zero",   "1": "One",    "2": "Two",    "3": "Three",
  "4": "Four",   "5": "Fife",   "6": "Six",    "7": "Seven",
  "8": "Eight",  "9": "Niner",
};

const WORD_ORIGINS: Record<string, string> = {
  Alfa:     "Spelled 'Alfa' (not 'Alpha') to avoid mispronunciation in languages where 'ph' sounds like 'f' is not guaranteed.",
  Bravo:    "Borrowed from Italian and Spanish, where it is an exclamation of praise, ensuring clear distinction from other B-words.",
  Charlie:  "A common English name chosen for its crisp, unambiguous pronunciation across languages.",
  Delta:    "From the Greek letter, used internationally in science and aviation long before the NATO alphabet was standardised.",
  Echo:     "Named after the Greek nymph Echo, chosen because the word sounds distinct and carries no misleading consonant clusters.",
  Foxtrot:  "A ballroom dance popular in the early 20th century, selected for its two clear, punchy syllables.",
  Golf:     "The sport, chosen because the hard G and short vowel make it impossible to confuse with other letters.",
  Hotel:    "An internationally recognised word, identical or near-identical in dozens of languages.",
  India:    "Represents the letter I and was chosen as a country name familiar to military personnel worldwide.",
  Juliett:  "Spelled with a double-t to prevent French speakers from dropping the final consonant, keeping the J sound clear.",
  Kilo:     "From the Greek 'khilioi' (thousand), already a universal prefix in science and the metric system.",
  Lima:     "The capital of Peru, chosen as a short, globally recognisable place name with a clean vowel ending.",
  Mike:     "A common English given name, selected for its single syllable and unmistakable M sound.",
  November: "The month name, used because it is spelled and pronounced consistently across most European languages.",
  Oscar:    "A well-known given name chosen for its open vowels and clear O sound at the start.",
  Papa:     "Used in many languages to mean 'father', making it one of the most universally understood words in the alphabet.",
  Quebec:   "The Canadian province, selected to represent Q because very few common words begin with Q in English.",
  Romeo:    "Shakespeare's famous character, chosen for its rolling R and clear vowel sequence.",
  Sierra:   "Spanish for 'mountain range', selected for its crisp S sound and international familiarity.",
  Tango:    "The Argentine dance, picked for its strong T and the fact that it is spelled the same in many languages.",
  Uniform:  "Chosen because it starts with the 'you' sound that clearly represents the letter U without ambiguity.",
  Victor:   "A common given name and title of triumph, selected for its sharp V and clean two-syllable structure.",
  Whiskey:  "The spirit, chosen because the Wh- opening is one of the clearest ways to represent the W sound.",
  "X-ray":  "One of the few internationally known X-words, making it the obvious choice for a letter with few common representatives.",
  Yankee:   "American slang for a US citizen, widely recognised globally and unambiguous in its Y opening.",
  Zulu:     "The South African people and language, chosen to end the alphabet with a word known worldwide.",
  Zero:     "The standard English word for 0, used to avoid confusion with the letter O.",
  One:      "Used instead of 'Wun' in some variants; the plain English word keeps digit calls simple.",
  Two:      "Spelled as 'Too' in some variants to prevent confusion with 'to' or 'too' in voice transmission.",
  Three:    "The standard digit word, chosen for its clear Th- opening that distinguishes it from other numbers.",
  Four:     "Straightforward English digit word with a distinct F sound.",
  Fife:     "Spelled 'Fife' (not 'Five') to prevent the V from being mistaken for B in noisy radio conditions.",
  Six:      "Short, sharp, and unambiguous, with no risk of confusion with other digit words.",
  Seven:    "Two clear syllables with a strong S opening, easy to distinguish from 'six' and 'eleven'.",
  Eight:    "The 'ay' vowel sound at the start makes it stand out clearly from other digit words.",
  Niner:    "Spelled 'Niner' (not 'Nine') to prevent confusion with the German 'nein' (no) in international communications.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitise(raw: string): string {
  return raw.replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
}

function toPhonetic(value: string): string {
  if (!value.trim()) return "";
  const words = value.split(" ");
  return words
    .filter((w) => w.length > 0)
    .map((word) =>
      word
        .split("")
        .map((ch) => NATO_MAP[ch] ?? ch)
        .join(" • ")
    )
    .join("  /  ");
}

function uniqueWords(value: string): string[] {
  const seen = new Set<string>();
  for (const ch of value) {
    const word = NATO_MAP[ch.toUpperCase()];
    if (word) seen.add(word);
  }
  return Array.from(seen);
}

function getInitialTheme(): "dark" | "light" {
  try {
    const stored = localStorage.getItem("nato-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch (_) { /* ignore */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialInput(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) return sanitise(decodeURIComponent(q));
  } catch (_) { /* ignore */ }
  return "HERMIONE";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Nato() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);
  const [input, setInput] = useState<string>(getInitialInput);
  const [learnOpen, setLearnOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus and pre-select on mount
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  // Persist theme
  useEffect(() => {
    try { localStorage.setItem("nato-theme", theme); } catch (_) { /* ignore */ }
  }, [theme]);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(sanitise(e.target.value));
  }

  function handleClear() {
    setInput("");
    inputRef.current?.focus();
  }

  const output = toPhonetic(input);
  const learnWords = uniqueWords(input);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      showToast("Copied to clipboard");
    } catch (_) {
      showToast("Could not copy");
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/nato?q=${encodeURIComponent(input)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "NATO Phonetic Alphabet", url });
      } catch (_) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied");
      } catch (_) {
        showToast("Could not copy link");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Theme tokens
  // ---------------------------------------------------------------------------
  const dark = theme === "dark";
  const bg        = dark ? "#1F1F1F" : "#F7F7F7";
  const cardBg    = dark ? "#2A2A2A" : "#FFFFFF";
  const fg        = dark ? "#E8E8E8" : "#1A1A1A";
  const muted     = dark ? "#9CA3AF" : "#9CA3AF";
  const border    = dark ? "#3A3A3A" : "#E0E0E0";
  const borderHov = dark ? "#666666" : "#AAAAAA";
  const btnBg     = dark ? "#333333" : "#F0F0F0";
  const btnHovBg  = dark ? "#444444" : "#E4E4E4";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px 64px",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
        fontSize: "14px",
        lineHeight: "1.75",
        color: fg,
        transition: "background 200ms, color 200ms",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
            fontSize: "13px",
            color: "#5A5A5A",
            textDecoration: "none",
            marginBottom: "40px",
            opacity: 1,
            transition: "opacity 150ms ease-out",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.opacity = "0.6")}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.opacity = "1")}
        >
          &#8627; back
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
          <h1 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: fg, lineHeight: "1.75" }}>
            NATO Phonetic Alphabet
          </h1>
          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label="Toggle dark mode"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 0 2px 8px",
              color: muted,
              fontSize: "14px",
              lineHeight: "1",
              flexShrink: 0,
            }}
          >
            {dark ? "☀" : "☽"}
          </button>
        </div>
        <p style={{ margin: "0 0 24px", color: muted, fontSize: "13px" }}>
          Never say &apos;B as in Boy&apos; again
        </p>

        {/* Input */}
        <InputField
          inputRef={inputRef}
          value={input}
          onChange={handleInput}
          onClear={handleClear}
          fg={fg}
          border={border}
          borderHov={borderHov}
          cardBg={cardBg}
          dark={dark}
        />
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: muted }}>
          Type anything to convert it
        </p>

        {/* Output */}
        {output && (
          <p style={{
            margin: "20px 0 0",
            fontWeight: 700,
            color: fg,
            wordBreak: "break-word",
            lineHeight: "2",
          }}>
            {output}
          </p>
        )}

        {/* Learn panel */}
        {learnWords.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <button
              onClick={() => setLearnOpen((o) => !o)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: btnBg,
                border: `1px solid ${border}`,
                color: fg,
                fontFamily: "inherit",
                fontSize: "13px",
                padding: "8px 12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = btnHovBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = btnBg)}
            >
              <span>💡 Learn about these words</span>
              <span style={{
                display: "inline-block",
                transform: learnOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms",
                fontSize: "10px",
              }}>▼</span>
            </button>
            <div style={{
              overflow: "hidden",
              maxHeight: learnOpen ? "9999px" : "0",
              transition: "max-height 300ms ease-out",
              border: learnOpen ? `1px solid ${border}` : "none",
              borderTop: "none",
            }}>
              <ul style={{ margin: 0, padding: "0", listStyle: "none" }}>
                {learnWords.map((word, i) => (
                  <li
                    key={word}
                    style={{
                      padding: "8px 12px",
                      borderTop: i > 0 ? `1px solid ${border}` : "none",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: fg }}>{word}:</span>{" "}
                    <span style={{ color: muted }}>{WORD_ORIGINS[word] ?? "A word chosen for its clear, unambiguous pronunciation in radio communications."}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {output && (
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <ActionButton label="Copy output" onClick={handleCopy} fg={fg} border={border} btnBg={btnBg} btnHovBg={btnHovBg} />
            <ActionButton label="Share tool" onClick={handleShare} fg={fg} border={border} btnBg={btnBg} btnHovBg={btnHovBg} />
          </div>
        )}

        {/* Footer */}
        <p style={{ marginTop: "48px", textAlign: "right", fontSize: "12px", color: muted }}>
          Crafted by{" "}
          <a
            href="https://www.linkedin.com/in/olayinkaetitilola/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: muted, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = fg)}
            onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
          >
            Olayinka ↗
          </a>
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: dark ? "#444" : "#1A1A1A",
          color: "#fff",
          fontFamily: "inherit",
          fontSize: "13px",
          padding: "8px 16px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface InputFieldProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  fg: string;
  border: string;
  borderHov: string;
  cardBg: string;
  dark: boolean;
}

function InputField({ inputRef, value, onChange, onClear, fg, border, borderHov, cardBg, dark }: InputFieldProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const activeBorder = focused ? "#FEF08A" : hovered ? borderHov : border;

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
          fontSize: "14px",
          lineHeight: "1.75",
          color: fg,
          background: cardBg,
          border: `1px solid ${activeBorder}`,
          padding: "8px 52px 8px 12px",
          outline: "none",
          cursor: "text",
          transition: "border-color 150ms",
        }}
      />
      {value && (
        <button
          onClick={onClear}
          tabIndex={-1}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "12px",
            color: "#9CA3AF",
            padding: "0",
            lineHeight: "1",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = fg)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  fg: string;
  border: string;
  btnBg: string;
  btnHovBg: string;
}

function ActionButton({ label, onClick, fg, border, btnBg, btnHovBg }: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
        fontSize: "13px",
        color: fg,
        background: hovered ? btnHovBg : btnBg,
        border: `1px solid ${border}`,
        padding: "8px 12px",
        cursor: "pointer",
        transition: "background 150ms",
        textAlign: "center",
      }}
    >
      {label}
    </button>
  );
}
