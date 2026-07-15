/**
 * /nato — NATO Phonetic Alphabet tool
 *
 * Design Philosophy: Minimal Monospace — same tokens as the rest of the site.
 * All colours via CSS variables / .dark class — no inline style tokens.
 *
 * Features:
 * - Real-time conversion with bullet separators and / word boundaries
 * - Dark/light mode toggle via shared ThemeToggle component
 * - Collapsible "Learn about these words" panel with word origins
 * - Copy output and Share tool action buttons
 * - URL ?q= state: read on mount, written on share
 * - Back link to home page (top-left)
 * - Footer linking to LinkedIn
 * - Input pre-filled with "HERMIONE", auto-focused, text pre-selected
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import PageMeta from "@/components/PageMeta";

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

// Reverse map: NATO word → letter
const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(NATO_MAP).map(([letter, word]) => [word.toLowerCase(), letter])
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitise(raw: string): string {
  return raw.replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
}

function sanitiseReverse(raw: string): string {
  // Allow letters, spaces and hyphens (for X-ray)
  return raw.replace(/[^A-Za-z -]/g, "");
}

function fromPhonetic(value: string): string {
  if (!value.trim()) return "";
  // Split on spaces, treating each word as a NATO code word
  const words = value.trim().toLowerCase().split(/\s+/);
  return words
    .map((w) => REVERSE_MAP[w] ?? "?")
    .join("");
}

function toPhonetic(value: string): string {
  if (!value.trim()) return "";
  return value
    .split(" ")
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

function getInitialInput(): string {
  try {
    if (typeof window === "undefined") return "HERMIONE";
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
  const [mode, setMode] = useState<"forward" | "reverse">("forward");
  const [input, setInput] = useState<string>(getInitialInput);
  const [reverseInput, setReverseInput] = useState<string>("");
  const [learnOpen, setLearnOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus and pre-select on mount
  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.focus(); el.select(); }
  }, []);

  // Re-focus when mode changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "forward") {
      setInput(sanitise(e.target.value));
    } else {
      setReverseInput(sanitiseReverse(e.target.value));
    }
  }

  function handleClear() {
    if (mode === "forward") setInput(""); else setReverseInput("");
    inputRef.current?.focus();
  }

  const activeInput = mode === "forward" ? input : reverseInput;
  const output = mode === "forward" ? toPhonetic(input) : fromPhonetic(reverseInput);
  const learnWords = mode === "forward" ? uniqueWords(input) : [];

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
      try { await navigator.share({ title: "NATO Phonetic Alphabet", url }); }
      catch (_) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied");
      } catch (_) {
        showToast("Could not copy link");
      }
    }
  }

  return (
    <div className="nato-page">
      <PageMeta
        title="NATO alphabet — Olayinka Titilola"
        description="Convert any word or phrase to the NATO phonetic alphabet instantly. Never say 'B as in Boy' again."
        path="/nato"
      />
      <div className="nato-inner">

        {/* Back link */}
        <Link href="/" className="nato-back">
          &#8627; back
        </Link>

        {/* Header row: title + theme toggle */}
        <div className="nato-header-row">
          <h1 className="nato-title">NATO Phonetic Alphabet</h1>
          <ThemeToggle className="nato-toggle" />
        </div>
        <p className="nato-subtitle">Never say &apos;B as in Boy&apos; again</p>

        {/* Mode toggle */}
        <div className="nato-mode-row">
          <button
            className={`nato-mode-btn${mode === "forward" ? " nato-mode-btn--active" : ""}`}
            onClick={() => setMode("forward")}
          >
            word → NATO
          </button>
          <button
            className={`nato-mode-btn${mode === "reverse" ? " nato-mode-btn--active" : ""}`}
            onClick={() => setMode("reverse")}
          >
            NATO → word
          </button>
        </div>

        {/* Input */}
        <NatoInput
          inputRef={inputRef}
          value={activeInput}
          onChange={handleInput}
          onClear={handleClear}
          placeholder={mode === "forward" ? "e.g. HERMIONE" : "e.g. Alpha Bravo Charlie"}
        />
        <p className="nato-hint">
          {mode === "forward"
            ? "Type anything to convert it"
            : "Type NATO words separated by spaces"}
        </p>

        {/* Output */}
        {output && <p className="nato-output">{output}</p>}

        {/* Learn panel */}
        {learnWords.length > 0 && (
          <div className="nato-learn">
            <button
              className="nato-learn-toggle"
              onClick={() => setLearnOpen((o) => !o)}
            >
              <span>💡 Learn about these words</span>
              <span className={`nato-learn-chevron${learnOpen ? " nato-learn-chevron--open" : ""}`}>▼</span>
            </button>
            <div className={`nato-learn-body${learnOpen ? " nato-learn-body--open" : ""}`}>
              <ul className="nato-learn-list">
                {learnWords.map((word, i) => (
                  <li
                    key={word}
                    className={`nato-learn-item${i < learnWords.length - 1 ? " nato-learn-item--bordered" : ""}`}
                  >
                    <span className="nato-learn-word">{word}:</span>{" "}
                    <span className="nato-learn-desc">
                      {WORD_ORIGINS[word] ?? "A word chosen for its clear, unambiguous pronunciation in radio communications."}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {output && (
          <div className="nato-actions">
            <button className="nato-btn" onClick={handleCopy}>Copy output</button>
            <button className="nato-btn" onClick={handleShare}>Share tool</button>
          </div>
        )}

        {/* Footer */}
        <p className="nato-footer">
          Crafted by{" "}
          <a
            href="https://www.linkedin.com/in/olayinkaetitilola/"
            target="_blank"
            rel="noopener noreferrer"
            className="nato-footer-link"
          >
            Olayinka ↗
          </a>
        </p>
      </div>

      {/* Toast */}
      {toast && <div className="nato-toast">{toast}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NatoInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
}

function NatoInput({ inputRef, value, onChange, onClear, placeholder }: NatoInputProps) {
  return (
    <div className="nato-input-wrap">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="nato-input"
      />
      {value && (
        <button
          onClick={onClear}
          tabIndex={-1}
          className="nato-clear"
        >
          Clear
        </button>
      )}
    </div>
  );
}
