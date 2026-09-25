/**
 * The visitor's language, English or French. Stored in localStorage and read
 * through useSyncExternalStore, so prerendered pages (always English) hydrate
 * without a mismatch and switch straight after.
 */

import { useSyncExternalStore } from "react";

export type Lang = "en" | "fr";

const STORAGE_KEY = "lang";
const listeners = new Set<() => void>();
let fallback: Lang = "en";

function read(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "fr" || stored === "en" ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function setLang(lang: Lang) {
  fallback = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Still switches for this visit when storage is unavailable.
  }
  document.documentElement.lang = lang;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "en");
}
