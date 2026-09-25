/**
 * NATO phonetic alphabet conversion, shared by the /nato page and its tests.
 */

/** What the speller shows before anyone types: radio talk, like the walkie-talkie. */
export const STARTER_WORD = "ROGER THAT";

export const NATO_MAP: Record<string, string> = {
  A: "Alfa",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Fife",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Niner",
};

// Reverse map: NATO word → letter
export const REVERSE_MAP: Record<string, string> = {
  // Standard NATO spellings
  ...Object.fromEntries(
    Object.entries(NATO_MAP).map(([letter, word]) => [
      word.toLowerCase(),
      letter,
    ])
  ),
  // Common variants
  alpha: "A", // Common misspelling of Alfa
  juliet: "J", // US spelling variant
  juliett: "J", // Official NATO spelling
};

// Validation: check if a word is a known NATO code word
function isValidNatoWord(word: string): boolean {
  return word.toLowerCase() in REVERSE_MAP;
}

// Get first unrecognised word for error message
export function getFirstInvalidWord(value: string): string | null {
  const words = value.trim().toLowerCase().split(/\s+/);
  for (const w of words) {
    if (w && !isValidNatoWord(w)) return w;
  }
  return null;
}

export function sanitise(raw: string): string {
  return raw.replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
}

export function sanitiseReverse(raw: string): string {
  // Allow letters, spaces and hyphens (for X-ray). A trailing space is kept
  // so the next word can be typed.
  return raw
    .replace(/[^A-Za-z -]/g, "")
    .replace(/ {2,}/g, " ")
    .trimStart();
}

export function fromPhonetic(value: string): string {
  if (!value.trim()) return "";
  // Split on multiple spaces, treating each word as a NATO code word
  const words = value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 0);
  return words.map(w => REVERSE_MAP[w] ?? "?").join("");
}

export function toPhonetic(value: string): string {
  if (!value.trim()) return "";
  return value
    .split(" ")
    .filter(w => w.length > 0)
    .map(word =>
      word
        .split("")
        .map(ch => NATO_MAP[ch] ?? ch)
        .join(" • ")
    )
    .join("  /  ");
}

export function uniqueWords(value: string): string[] {
  const seen = new Set<string>();
  for (const ch of value) {
    const word = NATO_MAP[ch.toUpperCase()];
    if (word) seen.add(word);
  }
  return Array.from(seen);
}
