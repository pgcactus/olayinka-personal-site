export type NatoMode = "forward" | "reverse";

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
  "1": "Wun",
  "2": "Too",
  "3": "Tree",
  "4": "Fower",
  "5": "Fife",
  "6": "Six",
  "7": "Seven",
  "8": "Ait",
  "9": "Niner",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(NATO_MAP).map(([character, word]) => [
    word.toLowerCase(),
    character,
  ])
);

Object.assign(REVERSE_MAP, {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  eight: "8",
  nine: "9",
});

const CHARACTER_FOR_WORD = Object.fromEntries(
  Object.entries(NATO_MAP).map(([character, word]) => [word, character])
);

export function sanitiseForward(raw: string): string {
  return raw.replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
}

export function sanitiseReverse(raw: string): string {
  return raw.replace(/[^A-Za-z -]/g, "");
}

export function toPhonetic(value: string): string {
  if (!value.trim()) return "";

  return value
    .trim()
    .split(/\s+/)
    .map(word =>
      [...word]
        .map(character => NATO_MAP[character.toUpperCase()])
        .filter(Boolean)
        .join(" • ")
    )
    .filter(Boolean)
    .join("  /  ");
}

export interface ReverseResult {
  output: string;
  invalidWords: string[];
}

export function fromPhonetic(value: string): ReverseResult {
  if (!value.trim()) return { output: "", invalidWords: [] };

  const invalidWords: string[] = [];
  const output = value
    .trim()
    .split(/\s+/)
    .map(word => {
      const character = REVERSE_MAP[word.toLowerCase()];
      if (!character) invalidWords.push(word);
      return character ?? "";
    })
    .join("");

  return { output, invalidWords };
}

export function uniqueCodeWords(value: string): string[] {
  const words = new Set<string>();
  for (const character of value) {
    const word = NATO_MAP[character.toUpperCase()];
    if (word) words.add(word);
  }
  return [...words];
}

export function getCodeWordNote(word: string): string {
  if (word === "Alfa") return "The official spelling uses “f”: Alfa.";
  if (word === "Juliett")
    return "The official spelling ends with two t’s: Juliett.";
  if (word === "X-ray") return "X-ray is written with a hyphen.";

  const character = CHARACTER_FOR_WORD[word];
  if (character && /\d/.test(character)) {
    return `${word} is the standard radiotelephony pronunciation for the digit ${character}.`;
  }
  return `${word} is the standard code word for the letter ${character}.`;
}

export interface NatoInitialState {
  mode: NatoMode;
  forwardInput: string;
  reverseInput: string;
}

export function getInitialNatoState(search = ""): NatoInitialState {
  const params = new URLSearchParams(search);
  const mode: NatoMode =
    params.get("mode") === "reverse" ? "reverse" : "forward";
  const query = params.get("q");

  if (mode === "reverse") {
    return {
      mode,
      forwardInput: "HERMIONE",
      reverseInput: query ? sanitiseReverse(query) : "",
    };
  }

  return {
    mode,
    forwardInput: query ? sanitiseForward(query) : "HERMIONE",
    reverseInput: "",
  };
}

export function buildNatoShareUrl(
  origin: string,
  mode: NatoMode,
  value: string
): string {
  const params = new URLSearchParams({ mode, q: value });
  return `${origin}/nato?${params.toString()}`;
}
