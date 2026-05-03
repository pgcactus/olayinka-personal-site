/**
 * /nato — NATO Phonetic Alphabet converter
 *
 * Style tokens (matches personal site):
 * - Background: #FFFFFF
 * - Body text: #5A5A5A, 14px, JetBrains Mono stack, line-height 1.75
 * - Near-black emphasis: #1A1A1A
 * - Yellow accent: #FEF08A (input focus ring)
 * - Max content width: 640px, top-aligned, 40px top padding
 * - Page fades in on mount (300ms ease-out)
 * - Back link: 13px, #5A5A5A, fades to 60% on hover
 */

import { motion } from "framer-motion";
import { useState } from "react";

// ---------------------------------------------------------------------------
// NATO alphabet map
// ---------------------------------------------------------------------------
const NATO: Record<string, string> = {
  A: "Alpha",   B: "Bravo",   C: "Charlie", D: "Delta",
  E: "Echo",    F: "Foxtrot", G: "Golf",    H: "Hotel",
  I: "India",   J: "Juliet",  K: "Kilo",    L: "Lima",
  M: "Mike",    N: "November",O: "Oscar",   P: "Papa",
  Q: "Quebec",  R: "Romeo",   S: "Sierra",  T: "Tango",
  U: "Uniform", V: "Victor",  W: "Whiskey", X: "X-ray",
  Y: "Yankee",  Z: "Zulu",
};

const DIGITS: Record<string, string> = {
  "0": "Zero",  "1": "One",   "2": "Two",   "3": "Three",
  "4": "Four",  "5": "Five",  "6": "Six",   "7": "Seven",
  "8": "Eight", "9": "Nine",
};

function convert(input: string): string {
  if (!input) return "";
  return input
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      if (NATO[upper]) return NATO[upper];
      if (DIGITS[ch]) return DIGITS[ch];
      if (ch === " ") return "/";
      return ch;
    })
    .join("  ");
}

// ---------------------------------------------------------------------------
// Back link: closes tab if opened as a new tab, otherwise navigates to /
// ---------------------------------------------------------------------------
function handleBack(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  if (window.history.length <= 1 || document.referrer === "") {
    window.close();
  } else {
    window.history.back();
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Nato() {
  const [input, setInput] = useState("");
  const output = convert(input);

  return (
    <motion.div
      className="nato-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="nato-content">
        {/* Back link */}
        <a href="/" onClick={handleBack} className="things-back">
          &#8627; back
        </a>

        {/* Heading */}
        <p className="nato-heading">NATO Phonetic Alphabet</p>

        {/* Input */}
        <input
          className="nato-input"
          type="text"
          placeholder="type something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Output */}
        {output && (
          <p className="nato-output">{output}</p>
        )}

        {/* Reference table */}
        <div className="nato-table-wrapper">
          <table className="nato-table">
            <tbody>
              {Object.entries(NATO).map(([letter, word]) => (
                <tr key={letter} className="nato-row">
                  <td className="nato-cell nato-cell--letter">{letter}</td>
                  <td className="nato-cell nato-cell--word">{word}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
