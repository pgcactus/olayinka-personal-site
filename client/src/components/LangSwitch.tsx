/**
 * Switches the site between English and French. Shows the language it
 * switches to (FR or EN) and says so to assistive tech.
 */

import { setLang, useLang } from "@/lib/lang";

const LABEL = { en: "Translate to French", fr: "Traduire en anglais" };

export default function LangSwitch({
  className,
  onSwitch,
}: {
  className?: string;
  /** Called with the switch; defaults to switching straight away. */
  onSwitch?: (apply: () => void) => void;
}) {
  const lang = useLang();
  const next = lang === "en" ? "fr" : "en";
  const apply = () => setLang(next);
  return (
    <button
      type="button"
      className={className}
      aria-label={LABEL[lang]}
      title={LABEL[lang]}
      onClick={() => (onSwitch ? onSwitch(apply) : apply())}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.9 15.1 10.4 12.6l.03-.03A17.5 17.5 0 0 0 14.1 6H17V4h-7V2H8v2H1v2h11.2A15.8 15.8 0 0 1 9 11.4 15.6 15.6 0 0 1 6.7 8H4.7a17.6 17.6 0 0 0 3 4.6l-5.1 5 1.4 1.4 5-5 3.1 3.1.8-2ZM18.5 10h-2L12 22h2l1.1-3h4.8l1.1 3h2l-4.5-12Zm-2.6 7 1.6-4.3 1.6 4.3h-3.2Z" />
      </svg>
      <span>{next.toUpperCase()}</span>
    </button>
  );
}
