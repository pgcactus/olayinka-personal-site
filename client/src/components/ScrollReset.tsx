/**
 * ScrollReset — watches route changes and scrolls to top on every navigation.
 * Uses wouter's useLocation hook to detect pathname changes.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollReset() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
