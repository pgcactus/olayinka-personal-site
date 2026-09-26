/**
 * /nato — NATO phonetic alphabet tool.
 *
 * - Word → NATO: each letter becomes a tile (letter above, code word below).
 *   New tiles pop in as you type; hovering, focusing or tapping a tile shows
 *   where its word comes from.
 * - NATO → word: type code words, get the word back, with a note on the
 *   first word it doesn't recognise.
 * - Copy the output or share a link; a shared ?q= is read after hydration so
 *   the first client render matches the prerendered HTML.
 */

import { useEffect, useRef, useState } from "react";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { useLang } from "@/lib/lang";
import {
  NATO_MAP,
  STARTER_WORD,
  fromPhonetic,
  getFirstInvalidWord,
  sanitise,
  sanitiseReverse,
  toPhonetic,
} from "@/lib/nato";
import "./nato.css";

const WORD_ORIGINS: Record<string, string> = {
  Alfa: "Spelled 'Alfa' (not 'Alpha') to avoid mispronunciation in languages where 'ph' sounds like 'f' is not guaranteed.",
  Bravo:
    "Borrowed from Italian and Spanish, where it is an exclamation of praise, ensuring clear distinction from other B-words.",
  Charlie:
    "A common English name chosen for its crisp, unambiguous pronunciation across languages.",
  Delta:
    "From the Greek letter, used internationally in science and aviation long before the NATO alphabet was standardised.",
  Echo: "Named after the Greek nymph Echo, chosen because the word sounds distinct and carries no misleading consonant clusters.",
  Foxtrot:
    "A ballroom dance popular in the early 20th century, selected for its two clear, punchy syllables.",
  Golf: "The sport, chosen because the hard G and short vowel make it impossible to confuse with other letters.",
  Hotel:
    "An internationally recognised word, identical or near-identical in dozens of languages.",
  India:
    "Represents the letter I and was chosen as a country name familiar to military personnel worldwide.",
  Juliett:
    "Spelled with a double-t to prevent French speakers from dropping the final consonant, keeping the J sound clear.",
  Kilo: "From the Greek 'khilioi' (thousand), already a universal prefix in science and the metric system.",
  Lima: "The capital of Peru, chosen as a short, globally recognisable place name with a clean vowel ending.",
  Mike: "A common English given name, selected for its single syllable and unmistakable M sound.",
  November:
    "The month name, used because it is spelled and pronounced consistently across most European languages.",
  Oscar:
    "A well-known given name chosen for its open vowels and clear O sound at the start.",
  Papa: "Used in many languages to mean 'father', making it one of the most universally understood words in the alphabet.",
  Quebec:
    "The Canadian province, selected to represent Q because very few common words begin with Q in English.",
  Romeo:
    "Shakespeare's famous character, chosen for its rolling R and clear vowel sequence.",
  Sierra:
    "Spanish for 'mountain range', selected for its crisp S sound and international familiarity.",
  Tango:
    "The Argentine dance, picked for its strong T and the fact that it is spelled the same in many languages.",
  Uniform:
    "Chosen because it starts with the 'you' sound that clearly represents the letter U without ambiguity.",
  Victor:
    "A common given name and title of triumph, selected for its sharp V and clean two-syllable structure.",
  Whiskey:
    "The spirit, chosen because the Wh- opening is one of the clearest ways to represent the W sound.",
  "X-ray":
    "One of the few internationally known X-words, making it the obvious choice for a letter with few common representatives.",
  Yankee:
    "American slang for a US citizen, widely recognised globally and unambiguous in its Y opening.",
  Zulu: "The South African people and language, chosen to end the alphabet with a word known worldwide.",
  Zero: "The standard English word for 0, used to avoid confusion with the letter O.",
  One: "Used instead of 'Wun' in some variants; the plain English word keeps digit calls simple.",
  Two: "Spelled as 'Too' in some variants to prevent confusion with 'to' or 'too' in voice transmission.",
  Three:
    "The standard digit word, chosen for its clear Th- opening that distinguishes it from other numbers.",
  Four: "Straightforward English digit word with a distinct F sound.",
  Fife: "Spelled 'Fife' (not 'Five') to prevent the V from being mistaken for B in noisy radio conditions.",
  Six: "Short, sharp, and unambiguous, with no risk of confusion with other digit words.",
  Seven:
    "Two clear syllables with a strong S opening, easy to distinguish from 'six' and 'eleven'.",
  Eight:
    "The 'ay' vowel sound at the start makes it stand out clearly from other digit words.",
  Niner:
    "Spelled 'Niner' (not 'Nine') to prevent confusion with the German 'nein' (no) in international communications.",
};

// French versions of the word stories. Worth a native speaker's read.
const WORD_ORIGINS_FR: Record<string, string> = {
  Alfa: "Écrit « Alfa » et non « Alpha », car le « ph » ne se prononce pas « f » dans toutes les langues.",
  Bravo:
    "Emprunté à l’italien et à l’espagnol, où c’est un cri d’éloge, bien distinct des autres mots en B.",
  Charlie:
    "Un prénom anglais courant, choisi pour sa prononciation nette dans toutes les langues.",
  Delta:
    "La lettre grecque, déjà utilisée en sciences et en aviation bien avant l’alphabet OTAN.",
  Echo: "D’après la nymphe grecque Écho : un mot distinct, sans groupe de consonnes trompeur.",
  Foxtrot:
    "Une danse de salon du début du XXe siècle, choisie pour ses deux syllabes franches.",
  Golf: "Le sport : son G dur et sa voyelle brève ne ressemblent à aucune autre lettre.",
  Hotel:
    "Un mot connu partout, identique ou presque dans des dizaines de langues.",
  India:
    "Pour la lettre I, un nom de pays familier aux militaires du monde entier.",
  Juliett:
    "Écrit avec deux t pour que les francophones ne laissent pas tomber la finale.",
  Kilo: "Du grec « khilioi » (mille), déjà un préfixe universel du système métrique.",
  Lima: "La capitale du Pérou : un nom court, connu partout, qui finit sur une voyelle nette.",
  Mike: "Un prénom anglais courant, choisi pour son unique syllabe et son M sans ambiguïté.",
  November:
    "Le nom du mois, écrit et prononcé de façon proche dans la plupart des langues européennes.",
  Oscar:
    "Un prénom connu, choisi pour ses voyelles ouvertes et son O bien net au début.",
  Papa: "Signifie « père » dans beaucoup de langues : l’un des mots les plus compris de l’alphabet.",
  Quebec:
    "La province canadienne, choisie pour le Q car peu de mots courants commencent par Q.",
  Romeo:
    "Le célèbre personnage de Shakespeare, choisi pour son R roulé et ses voyelles claires.",
  Sierra:
    "« Chaîne de montagnes » en espagnol, choisi pour son S net et sa notoriété.",
  Tango:
    "La danse argentine, choisie pour son T fort et une orthographe commune à beaucoup de langues.",
  Uniform:
    "Choisi car il commence par le son « you », qui représente clairement la lettre U.",
  Victor:
    "Un prénom courant qui évoque la victoire, avec un V net et deux syllabes simples.",
  Whiskey:
    "L’alcool : le « Wh » du début est l’une des façons les plus claires de dire le W.",
  "X-ray":
    "L’un des rares mots en X connus partout, choix évident pour une lettre peu fournie.",
  Yankee:
    "Surnom américain des habitants des États-Unis, connu partout et net sur le Y.",
  Zulu: "Le peuple et la langue d’Afrique du Sud, pour finir l’alphabet sur un mot connu de tous.",
  Zero: "Le mot anglais pour 0, pour ne pas le confondre avec la lettre O.",
  One: "Parfois prononcé « Wun » ; le mot simple garde l’annonce des chiffres claire.",
  Two: "Parfois prononcé « Too » pour éviter la confusion avec « to » ou « too » à la radio.",
  Three:
    "Le mot standard, choisi pour son « Th » qui le distingue des autres chiffres.",
  Four: "Un mot simple avec un F bien distinct.",
  Fife: "Écrit « Fife » et non « Five » pour que le V ne soit pas pris pour un B dans le bruit radio.",
  Six: "Court, net et sans risque de confusion avec les autres chiffres.",
  Seven: "Deux syllabes claires et un S fort, facile à distinguer de « six ».",
  Eight: "Le son « ay » du début le détache clairement des autres chiffres.",
  Niner:
    "Écrit « Niner » et non « Nine » pour éviter la confusion avec l’allemand « nein » (non).",
};

const STRINGS = {
  en: {
    title: "NATO Phonetic Alphabet",
    sub: "Never say ‘B as in Boy’ again.",
    mode: "Conversion mode",
    forward: "word → NATO",
    reverse: "NATO → word",
    typeAnything: "Type anything",
    typeWords: "Type NATO words, separated by spaces",
    clear: "clear",
    tileLabel: (letter: string, word: string) => `${letter} for ${word}`,
    hint: "hover or tap a word for its story",
    fallback:
      "A word chosen for its clear, unambiguous pronunciation in radio communications.",
    invalid: (w: string) =>
      `‘${w}’ isn’t a NATO word. Try Alfa, Bravo or Charlie.`,
    copy: "copy",
    share: "share",
    copied: "copied",
    copyFailed: "could not copy",
    linkCopied: "link copied",
    linkFailed: "could not copy the link",
    origins: WORD_ORIGINS,
  },
  fr: {
    title: "Alphabet phonétique OTAN",
    sub: "Ne dites plus jamais « B comme Bateau ».",
    mode: "Sens de conversion",
    forward: "mot → OTAN",
    reverse: "OTAN → mot",
    typeAnything: "Tapez n’importe quoi",
    typeWords: "Tapez des mots OTAN, séparés par des espaces",
    clear: "effacer",
    tileLabel: (letter: string, word: string) => `${letter} pour ${word}`,
    hint: "survolez ou touchez un mot pour son histoire",
    fallback:
      "Un mot choisi pour sa prononciation claire et sans ambiguïté à la radio.",
    invalid: (w: string) =>
      `« ${w} » n’est pas un mot OTAN. Essayez Alfa, Bravo ou Charlie.`,
    copy: "copier",
    share: "partager",
    copied: "copié",
    copyFailed: "copie impossible",
    linkCopied: "lien copié",
    linkFailed: "impossible de copier le lien",
    origins: WORD_ORIGINS_FR,
  },
};

type Mode = "forward" | "reverse";

function getSharedInput(): string | null {
  try {
    const q = new URLSearchParams(window.location.search).get("q");
    return q ? sanitise(q) : null;
  } catch {
    return null;
  }
}

/** Words of the input, each as its letters with their code words. */
function toTiles(value: string) {
  let n = 0;
  return value
    .split(" ")
    .filter(Boolean)
    .map(word =>
      [...word].map(ch => ({
        index: n++,
        letter: ch,
        word: NATO_MAP[ch] ?? ch,
      }))
    );
}

export default function Nato() {
  const [mode, setMode] = useState<Mode>("forward");
  const t = STRINGS[useLang()];
  const [input, setInput] = useState(STARTER_WORD);
  const [reverseInput, setReverseInput] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const shared = getSharedInput();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (shared) setInput(shared);
    // Ready to type over the starter word, except on touch screens, where
    // focusing would throw up the keyboard before anyone asks for it.
    const el = inputRef.current;
    if (el && window.matchMedia?.("(hover: hover)").matches) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPicked(null);
    inputRef.current?.focus();
  }

  const forward = mode === "forward";
  const value = forward ? input : reverseInput;
  const output = forward ? toPhonetic(input) : fromPhonetic(reverseInput);
  const tiles = forward ? toTiles(input) : [];
  const invalid =
    !forward && reverseInput.trim() ? getFirstInvalidWord(reverseInput) : null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (forward) {
      setInput(sanitise(event.target.value));
      setPicked(null);
    } else {
      setReverseInput(sanitiseReverse(event.target.value));
    }
  }

  function handleClear() {
    if (forward) setInput("");
    else setReverseInput("");
    setPicked(null);
    inputRef.current?.focus();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/nato?q=${encodeURIComponent(input)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "NATO Phonetic Alphabet", url });
      } catch {
        /* cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t.linkCopied);
    } catch {
      showToast(t.linkFailed);
    }
  }

  return (
    <div className="site-page">
      <PageMeta
        title="NATO alphabet — Olayinka Titilola"
        description="Convert any word or phrase to the NATO phonetic alphabet instantly. Never say 'B as in Boy' again."
        path="/nato"
      />
      <SiteHeader />

      <main className="nt">
        <div className="nt-heading">
          <h1 className="nt-title">{t.title}</h1>
          <p className="nt-sub">{t.sub}</p>
        </div>

        <div
          className={`nt-modes nt-modes--${mode}`}
          role="group"
          aria-label={t.mode}
        >
          <span className="nt-thumb" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={forward}
            onClick={() => switchMode("forward")}
          >
            {t.forward}
          </button>
          <button
            type="button"
            aria-pressed={!forward}
            onClick={() => switchMode("reverse")}
          >
            {t.reverse}
          </button>
        </div>

        <div className="nt-field">
          <label htmlFor="nato-input" className="nt-label">
            {forward ? t.typeAnything : t.typeWords}
          </label>
          <div className="nt-inputrow">
            <input
              id="nato-input"
              ref={inputRef}
              className={`nt-input nt-input--${mode}`}
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={forward ? STARTER_WORD : "Alfa Bravo Charlie"}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize={forward ? "characters" : "off"}
            />
            {value && (
              <button type="button" className="nt-clear" onClick={handleClear}>
                {t.clear}
              </button>
            )}
          </div>
        </div>

        {forward && tiles.length > 0 && (
          <>
            <div className="nt-tiles">
              {tiles.map(group => (
                <div
                  className={`nt-group${group.length > 7 ? " nt-group--long" : ""}`}
                  key={group[0].index}
                >
                  {group.map(tile => (
                    <button
                      type="button"
                      key={`${tile.index}-${tile.letter}`}
                      className={`nt-tile${picked === tile.word ? " nt-tile--on" : ""}`}
                      style={
                        {
                          "--nt-delay": `${Math.min(tile.index, 12) * 28}ms`,
                        } as React.CSSProperties
                      }
                      aria-label={t.tileLabel(tile.letter, tile.word)}
                      aria-pressed={picked === tile.word}
                      onMouseEnter={() => setPicked(tile.word)}
                      onFocus={() => setPicked(tile.word)}
                      onClick={() => setPicked(tile.word)}
                    >
                      <span className="nt-letter">{tile.letter}</span>
                      <span className="nt-word">{tile.word}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="nt-actions">
              <button type="button" className="nt-link" onClick={handleCopy}>
                {t.copy}
              </button>
              <button type="button" className="nt-link" onClick={handleShare}>
                {t.share}
              </button>
            </div>
            <p className="nt-origin" aria-live="polite">
              {picked ? (
                <>
                  <strong>{picked}.</strong> {t.origins[picked] ?? t.fallback}
                </>
              ) : (
                <span className="nt-muted">{t.hint}</span>
              )}
            </p>
          </>
        )}

        {!forward && output && (
          <>
            <p className="nt-result" aria-live="polite">
              {output}
            </p>
            <div className="nt-actions">
              <button type="button" className="nt-link" onClick={handleCopy}>
                {t.copy}
              </button>
            </div>
          </>
        )}
        {invalid && (
          <p className="nt-error" role="alert">
            {t.invalid(invalid)}
          </p>
        )}
      </main>

      {toast && (
        <div className="nt-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
