/**
 * Browser location for wouter, with a short cross-fade between pages where
 * the browser supports view transitions. Others, and anyone who prefers
 * reduced motion, just change page.
 */

import { flushSync } from "react-dom";
import { navigate, useBrowserLocation } from "wouter/use-browser-location";

type Navigate = typeof navigate;

const navigateWithTransition: Navigate = (to, options) => {
  const reduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (!document.startViewTransition || reduced) return navigate(to, options);
  document.startViewTransition(() => flushSync(() => navigate(to, options)));
};

export function useTransitionLocation(
  options?: Parameters<typeof useBrowserLocation>[0]
): [string, Navigate] {
  const [location] = useBrowserLocation(options);
  return [location, navigateWithTransition];
}
