import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import ThemeToggle from "@/components/ThemeToggle";
import {
  buildNatoShareUrl,
  fromPhonetic,
  getCodeWordNote,
  getInitialNatoState,
  sanitiseForward,
  sanitiseReverse,
  toPhonetic,
  uniqueCodeWords,
  type NatoMode,
} from "@/lib/nato";
import { ROUTE_META } from "@/site-meta";

function initialState() {
  return getInitialNatoState(
    typeof window === "undefined" ? "" : window.location.search
  );
}

export default function Nato() {
  const [initial] = useState(initialState);
  const [mode, setMode] = useState<NatoMode>(initial.mode);
  const [forwardInput, setForwardInput] = useState(initial.forwardInput);
  const [reverseInput, setReverseInput] = useState(initial.reverseInput);
  const [learnOpen, setLearnOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  const activeInput = mode === "forward" ? forwardInput : reverseInput;
  const reverseResult = fromPhonetic(reverseInput);
  const output =
    mode === "forward" ? toPhonetic(forwardInput) : reverseResult.output;
  const learnWords = mode === "forward" ? uniqueCodeWords(forwardInput) : [];

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "forward") {
      setForwardInput(sanitiseForward(event.target.value));
    } else {
      setReverseInput(sanitiseReverse(event.target.value));
    }
  }

  function handleClear() {
    if (mode === "forward") setForwardInput("");
    else setReverseInput("");
    inputRef.current?.focus();
  }

  function changeMode(nextMode: NatoMode) {
    setMode(nextMode);
    setLearnOpen(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      showToast("Copied to clipboard");
    } catch {
      showToast("Could not copy");
    }
  }

  async function handleShare() {
    const url = buildNatoShareUrl(window.location.origin, mode, activeInput);

    if (navigator.share) {
      try {
        await navigator.share({ title: "NATO Phonetic Alphabet", url });
      } catch {
        // Closing the native share sheet is not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast("Share link copied");
    } catch {
      showToast("Could not copy link");
    }
  }

  return (
    <div className="nato-page">
      <PageMeta meta={ROUTE_META.nato} />

      <main className="nato-inner">
        <Link href="/" className="nato-back">
          &#8627; back
        </Link>

        <div className="nato-header-row">
          <h1 className="nato-title">NATO Phonetic Alphabet</h1>
          <ThemeToggle className="nato-toggle" />
        </div>
        <p className="nato-subtitle">Never say &apos;B as in Boy&apos; again</p>

        <div className="nato-mode-row" aria-label="Conversion direction">
          <button
            type="button"
            className={`nato-mode-btn${mode === "forward" ? " nato-mode-btn--active" : ""}`}
            onClick={() => changeMode("forward")}
            aria-pressed={mode === "forward"}
          >
            word → NATO
          </button>
          <button
            type="button"
            className={`nato-mode-btn${mode === "reverse" ? " nato-mode-btn--active" : ""}`}
            onClick={() => changeMode("reverse")}
            aria-pressed={mode === "reverse"}
          >
            NATO → word
          </button>
        </div>

        <NatoInput
          inputRef={inputRef}
          value={activeInput}
          mode={mode}
          onChange={handleInput}
          onClear={handleClear}
        />
        <p className="nato-hint" id="nato-input-hint">
          {mode === "forward"
            ? "Letters and digits are converted as you type. Digits use standard radio pronunciations."
            : "Enter complete NATO code words separated by spaces."}
        </p>

        {mode === "reverse" && reverseResult.invalidWords.length > 0 && (
          <p className="nato-error" role="alert">
            Not recognised: {reverseResult.invalidWords.join(", ")}
          </p>
        )}

        {output && (
          <p className="nato-output" aria-live="polite">
            {output}
          </p>
        )}

        {learnWords.length > 0 && (
          <section className="nato-learn">
            <button
              type="button"
              className="nato-learn-toggle"
              onClick={() => setLearnOpen(open => !open)}
              aria-expanded={learnOpen}
              aria-controls="nato-reference"
            >
              <span>Reference for these code words</span>
              <span
                className={`nato-learn-chevron${learnOpen ? " nato-learn-chevron--open" : ""}`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>
            <div
              id="nato-reference"
              className={`nato-learn-body${learnOpen ? " nato-learn-body--open" : ""}`}
              hidden={!learnOpen}
            >
              <ul className="nato-learn-list">
                {learnWords.map((word, index) => (
                  <li
                    key={word}
                    className={`nato-learn-item${index < learnWords.length - 1 ? " nato-learn-item--bordered" : ""}`}
                  >
                    <span className="nato-learn-word">{word}:</span>{" "}
                    <span className="nato-learn-desc">
                      {getCodeWordNote(word)}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="https://www.nato.int/en/about-us/nato-history/history-by-theme/symbols-of-nato/nato-phonetic-alphabet"
                target="_blank"
                rel="noopener noreferrer"
                className="nato-source"
              >
                Official NATO reference ↗
              </a>
            </div>
          </section>
        )}

        {output && (
          <div className="nato-actions">
            <button type="button" className="nato-btn" onClick={handleCopy}>
              Copy output
            </button>
            <button type="button" className="nato-btn" onClick={handleShare}>
              Share tool
            </button>
          </div>
        )}

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
      </main>

      {toast && (
        <div className="nato-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

interface NatoInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  mode: NatoMode;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function NatoInput({
  inputRef,
  value,
  mode,
  onChange,
  onClear,
}: NatoInputProps) {
  const label = mode === "forward" ? "Word or phrase" : "NATO code words";

  return (
    <div className="nato-field">
      <label htmlFor="nato-input" className="nato-label">
        {label}
      </label>
      <div className="nato-input-wrap">
        <input
          id="nato-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={
            mode === "forward" ? "e.g. HERMIONE" : "e.g. Alfa Bravo Charlie"
          }
          aria-describedby="nato-input-hint"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="nato-input"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="nato-clear"
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
